<?php
// Shared helpers for the Italian Bites PHP back-end.
declare(strict_types=1);

require __DIR__ . '/config.php';

const ORDER_STATUSES = ['new', 'confirmed', 'completed', 'cancelled'];

function respond(int $status, $data): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $message): void
{
    respond($status, ['ok' => false, 'error' => $message]);
}

function json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 100000) fail(413, 'Request too large');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') fail(405, 'Use POST');
    // Same-origin check against cross-site form posts
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== explode(':', $host)[0]) fail(403, 'Forbidden');
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') === false) fail(415, 'Send JSON');
}

function db_configured(): bool
{
    return DB_PASSWORD !== 'PUT-THE-DATABASE-PASSWORD-HERE' && strpos(DB_NAME, 'u000000000_') !== 0;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    if (!db_configured()) fail(503, 'The database is not configured yet (api/config.php).');
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASSWORD,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC],
        );
    } catch (Throwable $e) {
        error_log('[italianbites] DB connection failed: ' . $e->getMessage());
        fail(503, 'Could not connect to the database. Check api/config.php.');
    }
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference VARCHAR(20) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        customer_name VARCHAR(200) NOT NULL,
        company VARCHAR(200) NOT NULL DEFAULT '',
        email VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        preferred_contact VARCHAR(20) NOT NULL DEFAULT 'Phone',
        fulfillment VARCHAR(10) NOT NULL,
        address VARCHAR(500) NULL,
        event_type VARCHAR(60) NOT NULL,
        event_date VARCHAR(10) NOT NULL,
        event_time VARCHAR(5) NOT NULL,
        guests INT NOT NULL,
        notes TEXT NOT NULL,
        items_json LONGTEXT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        admin_notes TEXT NOT NULL,
        INDEX idx_status (status),
        INDEX idx_event_date (event_date)
    ) DEFAULT CHARSET=utf8mb4");
    return $pdo;
}

function iso(string $mysqlUtc): string
{
    return gmdate('Y-m-d\TH:i:s.000\Z', strtotime($mysqlUtc . ' UTC'));
}

/** Converts a DB row to the same JSON shape the Node back-end returns. */
function order_from_row(array $r): array
{
    return [
        'id' => (int) $r['id'],
        'reference' => $r['reference'],
        'createdAt' => iso($r['created_at']),
        'updatedAt' => iso($r['updated_at']),
        'status' => $r['status'],
        'customer' => [
            'name' => $r['customer_name'],
            'company' => $r['company'],
            'email' => $r['email'],
            'phone' => $r['phone'],
            'preferredContact' => $r['preferred_contact'],
        ],
        'fulfillment' => $r['fulfillment'],
        'address' => $r['address'],
        'event' => [
            'type' => $r['event_type'],
            'date' => $r['event_date'],
            'time' => $r['event_time'],
            'guests' => (int) $r['guests'],
        ],
        'notes' => $r['notes'],
        'items' => json_decode($r['items_json'] ?: '[]', true),
        'subtotal' => (float) $r['subtotal'],
        'adminNotes' => $r['admin_notes'] ?? '',
    ];
}

function now_utc(): string
{
    return gmdate('Y-m-d H:i:s');
}

function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('ib_admin');
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 7,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    ini_set('session.gc_maxlifetime', (string) (60 * 60 * 24 * 7));
    session_start();
}

function is_admin(): bool
{
    start_admin_session();
    return !empty($_SESSION['admin']) && ($_SESSION['expires'] ?? 0) > time();
}

function require_admin(): void
{
    if (!is_admin()) fail(401, 'UNAUTHORIZED');
}

function str_field($v, int $max): string
{
    if (!is_string($v)) return '';
    $v = trim($v);
    return mb_substr($v, 0, $max);
}
