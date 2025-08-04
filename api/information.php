<?php
// api/information.php - อัพเดทรองรับ Pagination

require_once 'config.php';

$method = getMethod();
$input = getInput();
$params = getParams();

// Route requests based on action parameter
$action = $params['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGet($action, $params);
            break;
        case 'POST':
            handlePost($action, $input);
            break;
        case 'PUT':
            handlePut($action, $input, $params);
            break;
        case 'DELETE':
            handleDelete($action, $params);
            break;
        default:
            sendError("Method not allowed", 405);
    }
} catch (Exception $e) {
    logError("Information API Error", ['error' => $e->getMessage(), 'action' => $action]);
    sendError("Internal server error: " . $e->getMessage(), 500);
}

/**
 * Handle GET requests
 */
function handleGet($action, $params)
{
    switch ($action) {
        case 'suppliers':
            getSuppliers($params);
            break;
        case 'customers':
            getCustomers($params);
            break;
        case 'supplier':
            getSupplierById($params['id'] ?? null);
            break;
        case 'customer':
            getCustomerById($params['id'] ?? null);
            break;
        default:
            getAllInformation($params);
    }
}

/**
 * Handle POST requests  
 */
function handlePost($action, $input)
{
    switch ($action) {
        case 'supplier':
            createSupplier($input);
            break;
        case 'customer':
            createCustomer($input);
            break;
        default:
            sendError("Invalid action for POST", 400);
    }
}

/**
 * Handle PUT requests
 */
function handlePut($action, $input, $params)
{
    $id = $params['id'] ?? null;
    if (!$id) {
        sendError("ID is required for update", 400);
    }

    switch ($action) {
        case 'supplier':
            updateSupplier($id, $input);
            break;
        case 'customer':
            updateCustomer($id, $input);
            break;
        default:
            sendError("Invalid action for PUT", 400);
    }
}

/**
 * Handle DELETE requests
 */
function handleDelete($action, $params)
{
    $id = $params['id'] ?? null;
    if (!$id) {
        sendError("ID is required for delete", 400);
    }

    switch ($action) {
        case 'supplier':
            deactivateSupplier($id);
            break;
        case 'customer':
            deactivateCustomer($id);
            break;
        default:
            sendError("Invalid action for DELETE", 400);
    }
}

// ===== SUPPLIER FUNCTIONS =====

/**
 * Get suppliers with filtering และ pagination
 */
function getSuppliers($params)
{
    $pdo = getDB();

    $type = $params['type'] ?? 'Airline';
    $search = $params['search'] ?? '';
    $limit = (int)($params['limit'] ?? 100);
    $offset = (int)($params['offset'] ?? 0);
    $active = $params['active'] ?? 1;

    // Build WHERE conditions
    $where = ['active = ?'];
    $queryParams = [$active];

    // Filter by category based on type
    if ($type && $type !== 'all') {
        if ($type === 'Airline') {
            $where[] = 'category = ?';
            $queryParams[] = 'airline';
        } elseif ($type === 'Voucher') {
            $where[] = 'category = ?';
            $queryParams[] = 'supplier-voucher';
        } elseif ($type === 'Other') {
            $where[] = 'category = ?';
            $queryParams[] = 'supplier-other';
        }
    }

    // Add search condition
    if ($search) {
        $where[] = '(code LIKE ? OR name LIKE ? OR numeric_code LIKE ?)';
        $searchParam = "%$search%";
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
    }

    $whereClause = implode(' AND ', $where);

    try {
        // Count total records
        $countSql = "SELECT COUNT(*) as total FROM information WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($queryParams);
        $totalCount = $countStmt->fetch()['total'];

        // Get paginated data
        $sql = "SELECT * FROM information WHERE $whereClause ORDER BY code LIMIT ? OFFSET ?";
        $stmt = $pdo->prepare($sql);

        // Execute with all parameters
        $allParams = array_merge($queryParams, [$limit, $offset]);
        $stmt->execute($allParams);
        $suppliers = $stmt->fetchAll();

        sendSuccess([
            'data' => $suppliers,
            'total' => (int)$totalCount,
            'count' => count($suppliers),
            'limit' => $limit,
            'offset' => $offset
        ]);
    } catch (PDOException $e) {
        logError("Suppliers query error", ['error' => $e->getMessage(), 'params' => $params]);
        sendError("Database query failed: " . $e->getMessage(), 500);
    }
}

/**
 * Get customers with filtering และ pagination
 */
function getCustomers($params)
{
    $pdo = getDB();

    $search = $params['search'] ?? '';
    $limit = (int)($params['limit'] ?? 10);
    $offset = (int)($params['offset'] ?? 0);
    $active = $params['active'] ?? 1;

    // Build WHERE conditions
    $where = ['active = ?'];
    $queryParams = [$active];

    // Add search condition - ปรับปรุงให้ค้นหาได้ดีกว่า
    if ($search) {
        // ลบการเช็ค code search แบบเก่า ให้ค้นหาทุกแบบ
        $where[] = '(name LIKE ? OR code LIKE ? OR email LIKE ? OR phone LIKE ? OR address_line1 LIKE ? OR address_line2 LIKE ? OR address_line3 LIKE ?)';
        $searchParam = "%$search%";
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
        $queryParams[] = $searchParam;
    }

    $whereClause = implode(' AND ', $where);

    try {
        // Count total records
        $countSql = "SELECT COUNT(*) as total FROM customers WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($queryParams);
        $totalCount = $countStmt->fetch()['total'];

        // Get paginated data
        $sql = "SELECT *, 
                CONCAT_WS(' ', address_line1, address_line2, address_line3) as full_address
                FROM customers 
                WHERE $whereClause 
                ORDER BY name 
                LIMIT ? OFFSET ?";

        $stmt = $pdo->prepare($sql);

        // Execute with all parameters
        $allParams = array_merge($queryParams, [$limit, $offset]);
        $stmt->execute($allParams);
        $customers = $stmt->fetchAll();

        // Format response
        $formattedCustomers = array_map(function ($customer) {
            if (strlen($customer['name']) > 50) {
                $customer['name'] = substr($customer['name'], 0, 50) . '...';
            }
            $customer['address'] = $customer['full_address'];
            $customer['full_name'] = $customer['name'];
            return $customer;
        }, $customers);

        sendSuccess([
            'data' => $formattedCustomers,
            'total' => (int)$totalCount,
            'count' => count($formattedCustomers),
            'limit' => $limit,
            'offset' => $offset
        ]);
    } catch (PDOException $e) {
        logError("Customers query error", ['error' => $e->getMessage(), 'params' => $params]);
        sendError("Database query failed: " . $e->getMessage(), 500);
    }
}

/**
 * Get supplier by ID
 */
function getSupplierById($id)
{
    if (!$id) {
        sendError("Supplier ID is required", 400);
    }

    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM information WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $supplier = $stmt->fetch();

    if (!$supplier) {
        sendError("Supplier not found", 404);
    }

    sendSuccess($supplier);
}

/**
 * Get customer by ID
 */
function getCustomerById($id)
{
    if (!$id) {
        sendError("Customer ID is required", 400);
    }

    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT *, 
                          CONCAT_WS(' ', address_line1, address_line2, address_line3) as full_address
                          FROM customers WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $customer = $stmt->fetch();

    if (!$customer) {
        sendError("Customer not found", 404);
    }

    $customer['address'] = $customer['full_address'];
    sendSuccess($customer);
}

/**
 * Create new supplier
 */
function createSupplier($data)
{
    validateRequired($data, ['code', 'name', 'type']);

    $pdo = getDB();

    // Determine category based on type
    $category = 'supplier-other';
    if ($data['type'] === 'Airline') {
        $category = 'airline';
    } elseif ($data['type'] === 'Voucher') {
        $category = 'supplier-voucher';
    } elseif ($data['type'] === 'Other') {
        $category = 'supplier-other';
    }

    // 👇 ลบ transformToUpperCase ออก หรือเปลี่ยนเป็นแบบนี้
    $transformedData = [
        'category' => $category,
        'code' => strtoupper($data['code']), // เฉพาะ code ให้เป็นตัวใหญ่
        'name' => $data['name'], // 👈 ไม่แปลงเป็นตัวใหญ่
        'type' => $data['type'], // 👈 ไม่แปลงเป็นตัวใหญ่
        'numeric_code' => $data['numeric_code'] ?? null,
        'active' => 1,
        'created_at' => getThaiTimestamp()
    ];

    try {
        $sql = "INSERT INTO information (category, code, name, type, numeric_code, active, created_at) 
                VALUES (:category, :code, :name, :type, :numeric_code, :active, :created_at)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($transformedData);

        $supplierId = $pdo->lastInsertId();
        sendSuccess(['id' => $supplierId], 'Supplier created successfully');
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            sendError("Supplier code already exists", 409);
        } else {
            throw $e;
        }
    }
}

/**
 * Create new customer
 */
function createCustomer($data)
{
    validateRequired($data, ['name']);

    $pdo = getDB();

    if (isset($data['code']) && $data['code']) {
        if (strlen($data['code']) < 3 || strlen($data['code']) > 5) {
            sendError("รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร", 400);
        }
    }

    if (isset($data['email']) && $data['email'] && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError("รูปแบบอีเมลไม่ถูกต้อง", 400);
    }

    $addressLine1 = $data['address_line1'] ?? ($data['address'] ?? null);

    // 👇 ลบ transformToUpperCase ออก หรือเปลี่ยนเป็นแบบนี้
    $transformedData = [
        'name' => $data['name'], // 👈 ไม่แปลงเป็นตัวใหญ่
        'code' => isset($data['code']) ? strtoupper($data['code']) : null, // เฉพาะ code ให้เป็นตัวใหญ่
        'email' => isset($data['email']) ? strtolower($data['email']) : null,
        'address_line1' => $addressLine1, // 👈 ไม่แปลงเป็นตัวใหญ่
        'address_line2' => $data['address_line2'] ?? null, // 👈 ไม่แปลงเป็นตัวใหญ่
        'address_line3' => $data['address_line3'] ?? null, // 👈 ไม่แปลงเป็นตัวใหญ่
        'id_number' => $data['id_number'] ?? null,
        'phone' => $data['phone'] ?? null,
        'credit_days' => $data['credit_days'] ?? 0,
        'branch_type' => $data['branch_type'] ?? 'Head Office',
        'branch_number' => ($data['branch_type'] === 'Branch') ? $data['branch_number'] : null,
        'active' => 1,
        'created_at' => getThaiTimestamp(),
        'updated_at' => getThaiTimestamp()
    ];

    try {
        $sql = "INSERT INTO customers (name, code, email, address_line1, address_line2, address_line3, 
                id_number, phone, credit_days, branch_type, branch_number, active, created_at, updated_at) 
                VALUES (:name, :code, :email, :address_line1, :address_line2, :address_line3, 
                :id_number, :phone, :credit_days, :branch_type, :branch_number, :active, :created_at, :updated_at)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($transformedData);

        $customerId = $pdo->lastInsertId();
        sendSuccess(['id' => $customerId], 'Customer created successfully');
    } catch (PDOException $e) {
        throw $e;
    }
}

/**
 * Update supplier
 */
function updateSupplier($id, $data)
{
    validateRequired($data, ['code', 'name', 'type']);

    $pdo = getDB();

    $stmt = $pdo->prepare("SELECT id FROM information WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (!$stmt->fetch()) {
        sendError("Supplier not found", 404);
    }

    $category = 'supplier-other';
    if ($data['type'] === 'Airline') {
        $category = 'airline';
    } elseif ($data['type'] === 'Voucher') {
        $category = 'supplier-voucher';
    }

    // 👇 ลบ transformToUpperCase ออก
    $transformedData = [
        'category' => $category,
        'code' => strtoupper($data['code']), // เฉพาะ code ให้เป็นตัวใหญ่
        'name' => $data['name'], // 👈 ไม่แปลงเป็นตัวใหญ่
        'type' => $data['type'], // 👈 ไม่แปลงเป็นตัวใหญ่
        'numeric_code' => $data['numeric_code'] ?? null
    ];
    $transformedData['id'] = $id;

    try {
        $sql = "UPDATE information 
                SET category = :category, code = :code, name = :name, type = :type, numeric_code = :numeric_code
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($transformedData);

        sendSuccess(null, 'Supplier updated successfully');
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            sendError("Supplier code already exists", 409);
        } else {
            throw $e;
        }
    }
}

function updateCustomer($id, $data)
{
    validateRequired($data, ['name']);

    $pdo = getDB();

    $stmt = $pdo->prepare("SELECT id FROM customers WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (!$stmt->fetch()) {
        sendError("Customer not found", 404);
    }

    if (isset($data['code']) && $data['code']) {
        if (strlen($data['code']) < 3 || strlen($data['code']) > 5) {
            sendError("รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร", 400);
        }
    }

    if (isset($data['email']) && $data['email'] && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError("รูปแบบอีเมลไม่ถูกต้อง", 400);
    }

    $addressLine1 = $data['address_line1'] ?? ($data['address'] ?? null);

    // 👇 ลบ transformToUpperCase ออก
    $transformedData = [
        'name' => $data['name'], // 👈 ไม่แปลงเป็นตัวใหญ่
        'code' => isset($data['code']) ? strtoupper($data['code']) : null,
        'email' => isset($data['email']) ? strtolower($data['email']) : null,
        'address_line1' => $addressLine1, // 👈 ไม่แปลงเป็นตัวใหญ่
        'address_line2' => $data['address_line2'] ?? null, // 👈 ไม่แปลงเป็นตัวใหญ่
        'address_line3' => $data['address_line3'] ?? null, // 👈 ไม่แปลงเป็นตัวใหญ่
        'id_number' => $data['id_number'] ?? null,
        'phone' => $data['phone'] ?? null,
        'credit_days' => $data['credit_days'] ?? 0,
        'branch_type' => $data['branch_type'] ?? 'Head Office',
        'branch_number' => ($data['branch_type'] === 'Branch') ? $data['branch_number'] : null,
        'updated_at' => getThaiTimestamp()
    ];
    $transformedData['id'] = $id;

    try {
        $sql = "UPDATE customers 
                SET name = :name, code = :code, email = :email, address_line1 = :address_line1, 
                address_line2 = :address_line2, address_line3 = :address_line3, id_number = :id_number, 
                phone = :phone, credit_days = :credit_days, branch_type = :branch_type, 
                branch_number = :branch_number, updated_at = :updated_at
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($transformedData);

        sendSuccess(null, 'Customer updated successfully');
    } catch (PDOException $e) {
        throw $e;
    }
}

/**
 * Deactivate supplier
 */
function deactivateSupplier($id)
{
    $pdo = getDB();

    $stmt = $pdo->prepare("UPDATE information SET active = 0 WHERE id = :id");
    $result = $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        sendError("Supplier not found", 404);
    }

    sendSuccess(null, 'Supplier deactivated successfully');
}

/**
 * Deactivate customer
 */
function deactivateCustomer($id)
{
    $pdo = getDB();

    $stmt = $pdo->prepare("UPDATE customers SET active = 0 WHERE id = :id");
    $result = $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        sendError("Customer not found", 404);
    }

    sendSuccess(null, 'Customer deactivated successfully');
}

/**
 * Get all information (for general listing)
 */
function getAllInformation($params)
{
    $pdo = getDB();

    $search = $params['search'] ?? '';
    $active = $params['active'] ?? true;
    $limit = (int)($params['limit'] ?? 50);

    $where = ['active = :active'];
    $queryParams = ['active' => $active ? 1 : 0];

    if ($search) {
        $where[] = '(code LIKE :search OR name LIKE :search)';
        $queryParams['search'] = "%$search%";
    }

    $sql = "SELECT 'supplier' as type, id, category, code, name, numeric_code, active, created_at 
            FROM information 
            WHERE " . implode(' AND ', $where) . "
            UNION ALL
            SELECT 'customer' as type, id, 'customer' as category, code, name, id_number as numeric_code, active, created_at 
            FROM customers 
            WHERE " . implode(' AND ', $where) . "
            ORDER BY created_at DESC 
            LIMIT :limit";

    $queryParams['limit'] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($queryParams);
    $results = $stmt->fetchAll();

    sendSuccess($results);
}
