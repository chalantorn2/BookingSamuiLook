<?php
// api/config.php - Final CORS Fix

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ✅ Fixed CORS headers
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://samuilookbiz.com',
    'https://www.samuilookbiz.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Development fallback
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
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
        logError("Database connection failed", ['error' => $e->getMessage()]);
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
    // Connection successful - ไม่ต้องทำอะไร
} catch (Exception $e) {
    logError("Database connection test failed", ['error' => $e->getMessage()]);
    // ยังให้ script ทำงานต่อไป แต่ log error ไว้
}
