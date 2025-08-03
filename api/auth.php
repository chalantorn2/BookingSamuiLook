<?php
// api/auth.php - Authentication API
require_once 'config.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = getMethod();
$input = getInput();
$params = getParams();

// Route requests based on action parameter
$action = $params['action'] ?? '';

try {
    switch ($method) {
        case 'POST':
            handlePost($action, $input);
            break;
        case 'GET':
            handleGet($action);
            break;
        default:
            sendError("Method not allowed", 405);
    }
} catch (Exception $e) {
    logError("Auth API Error", ['error' => $e->getMessage(), 'action' => $action]);
    sendError("Internal server error: " . $e->getMessage(), 500);
}

/**
 * Handle POST requests
 */
function handlePost($action, $input)
{
    switch ($action) {
        case 'login':
            handleLogin($input);
            break;
        case 'logout':
            handleLogout();
            break;
        case 'change_password':
            handleChangePassword($input);
            break;
        default:
            sendError("Invalid action for POST", 400);
    }
}

/**
 * Handle GET requests
 */
function handleGet($action)
{
    switch ($action) {
        case 'check':
        case 'me':
            checkAuth();
            break;
        case 'user':
            getCurrentUser();
            break;
        default:
            sendError("Invalid action for GET", 400);
    }
}

/**
 * Handle user login
 */
function handleLogin($input)
{
    validateRequired($input, ['username', 'password']);

    $username = trim($input['username']);
    $password = trim($input['password']);

    if (empty($username) || empty($password)) {
        sendError("Username and password are required", 400);
    }

    $pdo = getDB();

    try {
        // Get user from database
        $stmt = $pdo->prepare("
            SELECT id, username, password, fullname, email, role, active, last_login 
            FROM users 
            WHERE username = :username AND active = 1
        ");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError("Invalid username or password", 401);
        }

        // Verify password
        if (!verifyPassword($password, $user['password'])) {
            sendError("Invalid username or password", 401);
        }

        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = :last_login WHERE id = :id");
        $stmt->execute([
            'last_login' => getThaiTimestamp(),
            'id' => $user['id']
        ]);

        // Create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['fullname'] = $user['fullname'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['login_time'] = time();

        // Remove password from response
        unset($user['password']);
        $user['last_login'] = getThaiTimestamp();

        sendSuccess([
            'user' => $user,
            'session' => [
                'user_id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'fullname' => $_SESSION['fullname'],
                'role' => $_SESSION['role'],
                'email' => $_SESSION['email']
            ]
        ], 'Login successful');
    } catch (PDOException $e) {
        logError("Login database error", ['error' => $e->getMessage(), 'username' => $username]);
        sendError("Login failed", 500);
    }
}

/**
 * Handle user logout
 */
function handleLogout()
{
    // Destroy session
    session_unset();
    session_destroy();

    // Start new session for future requests
    session_start();

    sendSuccess(null, 'Logout successful');
}

/**
 * Check if user is authenticated
 */
function checkAuth()
{
    if (!isAuthenticated()) {
        sendError("Not authenticated", 401);
    }

    sendSuccess([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'fullname' => $_SESSION['fullname'],
            'role' => $_SESSION['role'],
            'email' => $_SESSION['email'] ?? null
        ]
    ], 'Authenticated');
}

/**
 * Get current user information
 */
function getCurrentUser()
{
    if (!isAuthenticated()) {
        sendError("Not authenticated", 401);
    }

    $pdo = getDB();

    try {
        $stmt = $pdo->prepare("
            SELECT id, username, fullname, email, role, active, created_at, last_login 
            FROM users 
            WHERE id = :id
        ");
        $stmt->execute(['id' => $_SESSION['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            // User not found, destroy session
            session_destroy();
            sendError("User not found", 404);
        }

        if ($user['active'] != 1) {
            // User deactivated, destroy session
            session_destroy();
            sendError("User account deactivated", 403);
        }

        sendSuccess($user);
    } catch (PDOException $e) {
        logError("Get user error", ['error' => $e->getMessage(), 'user_id' => $_SESSION['user_id']]);
        sendError("Failed to get user information", 500);
    }
}

/**
 * Handle password change
 */
function handleChangePassword($input)
{
    if (!isAuthenticated()) {
        sendError("Not authenticated", 401);
    }

    validateRequired($input, ['current_password', 'new_password']);

    $currentPassword = trim($input['current_password']);
    $newPassword = trim($input['new_password']);
    $confirmPassword = trim($input['confirm_password'] ?? '');

    if (empty($currentPassword) || empty($newPassword)) {
        sendError("Current and new passwords are required", 400);
    }

    if ($confirmPassword && $newPassword !== $confirmPassword) {
        sendError("New password and confirmation do not match", 400);
    }

    if (strlen($newPassword) < 6) {
        sendError("New password must be at least 6 characters long", 400);
    }

    $pdo = getDB();

    try {
        // Get current user
        $stmt = $pdo->prepare("SELECT id, password FROM users WHERE id = :id");
        $stmt->execute(['id' => $_SESSION['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError("User not found", 404);
        }

        // Verify current password
        if (!verifyPassword($currentPassword, $user['password'])) {
            sendError("Current password is incorrect", 401);
        }

        // Hash new password
        $hashedPassword = hashPassword($newPassword);

        // Update password
        $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
        $stmt->execute([
            'password' => $hashedPassword,
            'id' => $_SESSION['user_id']
        ]);

        sendSuccess(null, 'Password changed successfully');
    } catch (PDOException $e) {
        logError("Change password error", ['error' => $e->getMessage(), 'user_id' => $_SESSION['user_id']]);
        sendError("Failed to change password", 500);
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated()
{
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if user has required role
 */
function hasRole($requiredRole)
{
    if (!isAuthenticated()) {
        return false;
    }

    $userRole = $_SESSION['role'] ?? 'viewer';

    // Role hierarchy: admin > manager > viewer
    $roleHierarchy = [
        'admin' => 3,
        'manager' => 2,
        'viewer' => 1
    ];

    $userLevel = $roleHierarchy[$userRole] ?? 0;
    $requiredLevel = $roleHierarchy[$requiredRole] ?? 0;

    return $userLevel >= $requiredLevel;
}

/**
 * Require authentication middleware
 */
function requireAuth($requiredRole = null)
{
    if (!isAuthenticated()) {
        sendError("Authentication required", 401);
    }

    if ($requiredRole && !hasRole($requiredRole)) {
        sendError("Insufficient permissions", 403);
    }

    return true;
}

/**
 * Hash password
 */
function hashPassword($password)
{
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash)
{
    // First try PHP's password_verify for hashed passwords
    if (password_verify($password, $hash)) {
        return true;
    }

    // Fallback: check if it's a plain text password (for migration from old system)
    // This should be removed after all passwords are properly hashed
    if ($password === $hash) {
        return true;
    }

    return false;
}

/**
 * Get session info for debugging
 */
function getSessionInfo()
{
    if (!isAuthenticated()) {
        return [
            'authenticated' => false,
            'session_id' => session_id(),
            'session_data' => []
        ];
    }

    return [
        'authenticated' => true,
        'session_id' => session_id(),
        'user_id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role'],
        'login_time' => $_SESSION['login_time'] ?? null
    ];
}

/**
 * Clean expired sessions (can be called periodically)
 */
function cleanExpiredSessions()
{
    // Clean sessions older than 24 hours
    $maxLifetime = 24 * 60 * 60; // 24 hours in seconds

    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > $maxLifetime) {
        session_unset();
        session_destroy();
        sendError("Session expired", 401);
    }
}

// Auto-check session expiry on each request (optional)
if (isAuthenticated()) {
    cleanExpiredSessions();
}
