<?php
// POST /api/orders.php?action=create — saves a customer's order.
// Prices are always recalculated here from menu.json; the browser's totals are never trusted.
declare(strict_types=1);
require __DIR__ . '/lib.php';

$action = $_GET['action'] ?? '';
if ($action !== 'create') fail(404, 'Unknown action');
require_post();

$settings = json_decode((string) file_get_contents(__DIR__ . '/menu.json'), true);
if (!is_array($settings)) fail(500, 'Menu data missing');
$menu = [];
foreach ($settings['menu'] as $m) $menu[$m['id']] = $m;

$in = json_body();
$errors = [];

// Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
if (!empty($in['website'])) {
    respond(200, ['ok' => true, 'reference' => 'IB-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6))]);
}

$c = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$name = str_field($c['name'] ?? '', 200);
$company = str_field($c['company'] ?? '', 200);
$email = str_field($c['email'] ?? '', 200);
$phone = str_field($c['phone'] ?? '', 50);
$preferred = $c['preferredContact'] ?? 'Phone';
if (!in_array($preferred, ['Phone', 'Text', 'Email'], true)) $preferred = 'Phone';

if (mb_strlen($name) < 2) $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (strlen(preg_replace('/\D/', '', $phone)) < 10) $errors[] = 'phone';

$fulfillment = $in['fulfillment'] ?? '';
if (!in_array($fulfillment, ['delivery', 'pickup'], true)) $errors[] = 'fulfillment';
$address = $fulfillment === 'delivery' ? str_field($in['address'] ?? '', 500) : null;
if ($fulfillment === 'delivery' && mb_strlen((string) $address) < 6) $errors[] = 'address';

$e = is_array($in['event'] ?? null) ? $in['event'] : [];
$eventType = $e['type'] ?? '';
$date = $e['date'] ?? '';
$time = $e['time'] ?? '';
$guests = $e['guests'] ?? 0;
if (!in_array($eventType, $settings['eventTypes'], true)) $errors[] = 'event type';
if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) $errors[] = 'date';
if (!is_string($time) || !preg_match('/^\d{2}:\d{2}$/', $time)) $errors[] = 'time';
if (!is_int($guests) || $guests < 1 || $guests > 5000) $errors[] = 'guests';

$notes = str_field($in['notes'] ?? '', 2000);

// Items: recompute prices from the menu
$items = [];
$subtotal = 0;
$rawItems = is_array($in['items'] ?? null) ? $in['items'] : [];
if (count($rawItems) < 1 || count($rawItems) > 100) $errors[] = 'items';
foreach ($rawItems as $line) {
    $id = is_array($line) ? ($line['id'] ?? '') : '';
    $qty = is_array($line) ? ($line['quantity'] ?? 0) : 0;
    if (!isset($menu[$id]) || !is_int($qty) || $qty < 1 || $qty > 500) { $errors[] = 'items'; break; }
    $m = $menu[$id];
    $size = $m['size'];
    $price = $m['price'];
    foreach ($m['sizes'] as $s) {
        if (($line['size'] ?? '') === $s['label']) { $size = $s['label']; $price = $s['price']; }
    }
    $lineTotal = $price * $qty;
    $subtotal += $lineTotal;
    $items[] = [
        'id' => $m['id'], 'name' => $m['name'], 'category' => $m['category'], 'size' => $size,
        'unitPrice' => $price, 'quantity' => $qty, 'lineTotal' => $lineTotal,
    ];
}

if ($errors) fail(422, 'Please check: ' . implode(', ', array_unique($errors)));
if ($subtotal < $settings['minimumOrder']) fail(422, 'Minimum order is $' . $settings['minimumOrder']);

// Lead time (one day of slack for time zones)
$earliest = gmdate('Y-m-d', time() + ($settings['leadTimeDays'] - 1) * 86400);
if ($date < $earliest) fail(422, 'Please order at least ' . $settings['leadTimeDays'] . ' days ahead');

$pdo = db();
$now = now_utc();
for ($attempt = 0; $attempt < 5; $attempt++) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $ref = 'IB-';
    for ($i = 0; $i < 6; $i++) $ref .= $chars[random_int(0, strlen($chars) - 1)];
    try {
        $st = $pdo->prepare('INSERT INTO orders (reference, created_at, updated_at, status, customer_name, company, email, phone,
            preferred_contact, fulfillment, address, event_type, event_date, event_time, guests, notes, items_json, subtotal, admin_notes)
            VALUES (?, ?, ?, \'new\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'\')');
        $st->execute([$ref, $now, $now, $name, $company, $email, $phone, $preferred, $fulfillment, $address,
            $eventType, $date, $time, $guests, $notes, json_encode($items, JSON_UNESCAPED_UNICODE), $subtotal]);
        respond(200, ['ok' => true, 'reference' => $ref]);
    } catch (PDOException $ex) {
        if ($ex->getCode() !== '23000') { // not a duplicate reference
            error_log('[italianbites] insert failed: ' . $ex->getMessage());
            fail(500, 'Could not save the order');
        }
    }
}
fail(500, 'Could not save the order');
