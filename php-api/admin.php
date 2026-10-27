<?php
// /api/admin.php?action=session|login|logout|list|update|delete — the order admin.
declare(strict_types=1);
require __DIR__ . '/lib.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'session':
        $storage = 'mysql';
        if (!db_configured()) $storage = 'file'; // shows the "no database" warning in the admin
        respond(200, ['configured' => true, 'loggedIn' => is_admin(), 'storage' => $storage]);

    case 'login':
        require_post();
        start_admin_session();
        // Throttle: after 5 wrong attempts, wait 60 seconds (per browser session and per IP)
        $ip = preg_replace('/[^0-9a-f:.]/i', '', $_SERVER['REMOTE_ADDR'] ?? 'x');
        $lockFile = sys_get_temp_dir() . '/ib_login_' . md5($ip . __DIR__);
        $lock = is_file($lockFile) ? json_decode((string) file_get_contents($lockFile), true) : ['n' => 0, 'until' => 0];
        if (($lock['until'] ?? 0) > time()) {
            respond(200, ['ok' => false, 'error' => 'Too many attempts. Wait a minute and try again.']);
        }
        $in = json_body();
        $email = strtolower(trim((string) ($in['email'] ?? '')));
        $password = (string) ($in['password'] ?? '');
        $emailOk = hash_equals(strtolower(ADMIN_EMAIL), $email);
        $passOk = password_verify($password, ADMIN_PASSWORD_HASH); // always checked: same timing either way
        if (!$emailOk || !$passOk) {
            $n = ($lock['n'] ?? 0) + 1;
            @file_put_contents($lockFile, json_encode(['n' => $n, 'until' => $n >= 5 ? time() + 60 : 0]));
            usleep(600000);
            respond(200, ['ok' => false, 'error' => 'Wrong email or password.']);
        }
        @unlink($lockFile);
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['expires'] = time() + 60 * 60 * 24 * 7;
        respond(200, ['ok' => true]);

    case 'logout':
        require_post();
        start_admin_session();
        $_SESSION = [];
        session_destroy();
        setcookie('ib_admin', '', ['expires' => time() - 3600, 'path' => '/']);
        respond(200, ['ok' => true]);

    case 'list':
        require_admin();
        $rows = db()->query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 2000')->fetchAll();
        respond(200, array_map('order_from_row', $rows));

    case 'update':
        require_post();
        require_admin();
        $in = json_body();
        $id = $in['id'] ?? null;
        if (!is_int($id)) fail(422, 'Invalid order');
        $sets = [];
        $vals = [];
        if (isset($in['status'])) {
            if (!in_array($in['status'], ORDER_STATUSES, true)) fail(422, 'Invalid status');
            $sets[] = 'status = ?';
            $vals[] = $in['status'];
        }
        if (array_key_exists('adminNotes', $in)) {
            if (!is_string($in['adminNotes']) || mb_strlen($in['adminNotes']) > 5000) fail(422, 'Invalid notes');
            $sets[] = 'admin_notes = ?';
            $vals[] = $in['adminNotes'];
        }
        $pdo = db();
        if ($sets) {
            $sets[] = 'updated_at = ?';
            $vals[] = now_utc();
            $vals[] = $id;
            $pdo->prepare('UPDATE orders SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
        }
        $st = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) fail(404, 'Order not found');
        respond(200, order_from_row($row));

    case 'delete':
        require_post();
        require_admin();
        $in = json_body();
        $id = $in['id'] ?? null;
        if (!is_int($id)) fail(422, 'Invalid order');
        $st = db()->prepare('DELETE FROM orders WHERE id = ?');
        $st->execute([$id]);
        respond(200, ['ok' => $st->rowCount() > 0]);

    default:
        fail(404, 'Unknown action');
}
