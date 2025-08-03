<?php
// api/config.php - Database Configuration & Helper Functions
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'samui_booking');
define('DB_USER', 'samui_booking');
define('DB_PASS', 'qB$6875sc');
define('DB_CHARSET', 'utf8mb4');

/**
 * Get Database Connection
 */
function getDB()
{
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        sendError("Database connection failed: " . $e->getMessage(), 500);
    }
}

/**
 * Send JSON Response
 */
function sendJSON($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send Error Response
 */
function sendError($message, $status = 400)
{
    sendJSON(['error' => $message], $status);
}

/**
 * Send Success Response
 */
function sendSuccess($data = null, $message = 'Success')
{
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    sendJSON($response);
}

/**
 * Get Request Input
 */
function getInput()
{
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

/**
 * Get Request Method
 */
function getMethod()
{
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Get URL Parameters
 */
function getParams()
{
    return $_GET;
}

/**
 * Validate Required Fields
 */
function validateRequired($data, $requiredFields)
{
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        sendError("Missing required fields: " . implode(', ', $missing));
    }
}

/**
 * Transform data to uppercase (like Supabase transformToUpperCase)
 */
function transformToUpperCase($data, $excludeFields = [])
{
    if (!is_array($data)) {
        return $data;
    }

    // Default exclude fields
    $defaultExclude = [
        'id',
        'created_at',
        'updated_at',
        'email',
        'password',
        'phone',
        'username',
        'fullname',
        'password_hash',
        'last_login',
        'active',
        'credit_days',
        'age',
        'quantity',
        'net_price',
        'sale_price',
        'total_amount',
        'pax',
        'total',
        'vat_percent',
        'vat_amount',
        'grand_total',
        'issue_date',
        'due_date',
        'po_generated_at'
    ];

    $excludeFields = array_merge($defaultExclude, $excludeFields);
    $result = [];

    foreach ($data as $key => $value) {
        if (in_array($key, $excludeFields)) {
            $result[$key] = $value;
        } else if (is_string($value)) {
            $result[$key] = strtoupper($value);
        } else if (is_array($value)) {
            $result[$key] = transformToUpperCase($value, $excludeFields);
        } else {
            $result[$key] = $value;
        }
    }

    return $result;
}

/**
 * Get Thai timestamp (UTC+7)
 */
function getThaiTimestamp()
{
    $now = new DateTime('now', new DateTimeZone('Asia/Bangkok'));
    return $now->format('Y-m-d H:i:s');
}

/**
 * Format date for Thai timezone
 */
function formatThaiDate($date)
{
    if (!$date) return null;

    try {
        $dt = new DateTime($date);
        $dt->setTimezone(new DateTimeZone('Asia/Bangkok'));
        return $dt->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Pagination helper
 */
function paginate($query, $params = [], $page = 1, $limit = 10)
{
    $pdo = getDB();

    // Count total records
    $countQuery = preg_replace('/SELECT.*?FROM/i', 'SELECT COUNT(*) as total FROM', $query);
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];

    // Calculate offset
    $offset = ($page - 1) * $limit;

    // Add LIMIT and OFFSET to original query
    $query .= " LIMIT :limit OFFSET :offset";
    $params['limit'] = $limit;
    $params['offset'] = $offset;

    // Execute paginated query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    return [
        'data' => $data,
        'pagination' => [
            'total' => (int)$total,
            'page' => (int)$page,
            'limit' => (int)$limit,
            'pages' => ceil($total / $limit)
        ]
    ];
}

/**
 * Log error for debugging
 */
function logError($message, $context = [])
{
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    if (!empty($context)) {
        $logMessage .= " Context: " . json_encode($context);
    }
    error_log($logMessage);
}

// Test database connection on first load
try {
    $testDB = getDB();
    // Connection successful
} catch (Exception $e) {
    logError("Database connection test failed", ['error' => $e->getMessage()]);
}
