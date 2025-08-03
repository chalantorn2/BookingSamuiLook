<?php
// api/information.php - Information Module API
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
            // Default: get all information (suppliers + customers)
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
        case 'deactivate_supplier':
            deactivateSupplier($id);
            break;
        case 'deactivate_customer':
            deactivateCustomer($id);
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
            deactivateSupplier($id); // Soft delete
            break;
        case 'customer':
            deactivateCustomer($id); // Soft delete
            break;
        default:
            sendError("Invalid action for DELETE", 400);
    }
}

// ===== SUPPLIER FUNCTIONS =====

/**
 * Get suppliers with filtering
 */
function getSuppliers($params)
{
    $pdo = getDB();

    $type = $params['type'] ?? 'Airline';
    $search = $params['search'] ?? '';
    $limit = (int)($params['limit'] ?? 100);
    $active = $params['active'] ?? true;

    // Build query
    $where = ['active = :active'];
    $queryParams = ['active' => $active ? 1 : 0];

    // Filter by category based on type
    if ($type === 'Airline') {
        $where[] = 'category = :category';
        $queryParams['category'] = 'airline';
    } elseif ($type === 'Voucher') {
        $where[] = 'category = :category';
        $queryParams['category'] = 'supplier-voucher';
    } elseif ($type === 'Other') {
        $where[] = 'category = :category';
        $queryParams['category'] = 'supplier-other';
    }

    // Add search condition
    if ($search) {
        $where[] = '(code LIKE :search OR name LIKE :search OR numeric_code LIKE :search)';
        $queryParams['search'] = "%$search%";
    }

    $sql = "SELECT * FROM information WHERE " . implode(' AND ', $where) . " ORDER BY code LIMIT :limit";
    $queryParams['limit'] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($queryParams);
    $suppliers = $stmt->fetchAll();

    sendSuccess($suppliers);
}

/**
 * Get customers with filtering
 */
function getCustomers($params)
{
    $pdo = getDB();

    $search = $params['search'] ?? '';
    $limit = (int)($params['limit'] ?? 10);
    $active = $params['active'] ?? true;

    // Build query
    $where = ['active = :active'];
    $queryParams = ['active' => $active ? 1 : 0];

    // Add search condition
    if ($search) {
        // Check if it's a code search (short string, alphanumeric)
        $isCodeSearch = strlen($search) <= 5 && ctype_alnum($search);

        if ($isCodeSearch) {
            $where[] = 'code = :code';
            $queryParams['code'] = strtoupper($search);
            $orderBy = 'ORDER BY created_at DESC LIMIT 3';
        } else {
            $where[] = '(name LIKE :search OR code LIKE :search OR email LIKE :search OR phone LIKE :search OR address_line1 LIKE :search)';
            $queryParams['search'] = "%$search%";
            $orderBy = 'ORDER BY name LIMIT :limit';
            $queryParams['limit'] = $limit;
        }
    } else {
        $orderBy = 'ORDER BY name LIMIT :limit';
        $queryParams['limit'] = $limit;
    }

    $sql = "SELECT *, 
            CONCAT_WS(' ', address_line1, address_line2, address_line3) as full_address
            FROM customers 
            WHERE " . implode(' AND ', $where) . " $orderBy";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($queryParams);
    $customers = $stmt->fetchAll();

    // Format response to match frontend expectations
    $formattedCustomers = array_map(function ($customer) {
        // Truncate long names
        if (strlen($customer['name']) > 50) {
            $customer['name'] = substr($customer['name'], 0, 50) . '...';
        }

        // Add backward compatibility fields
        $customer['address'] = $customer['full_address'];
        $customer['full_name'] = $customer['name'];

        return $customer;
    }, $customers);

    sendSuccess($formattedCustomers);
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

    // Add backward compatibility
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
    $category = 'supplier-other'; // default
    if ($data['type'] === 'Airline') {
        $category = 'airline';
    } elseif ($data['type'] === 'Voucher') {
        $category = 'supplier-voucher';
    } elseif ($data['type'] === 'Other') {
        $category = 'supplier-other';
    }

    // Transform data to uppercase
    $transformedData = transformToUpperCase([
        'category' => $category,
        'code' => $data['code'],
        'name' => $data['name'],
        'type' => $data['type'],
        'numeric_code' => $data['numeric_code'] ?? null,
        'active' => 1,
        'created_at' => getThaiTimestamp()
    ]);

    try {
        $sql = "INSERT INTO information (category, code, name, type, numeric_code, active, created_at) 
                VALUES (:category, :code, :name, :type, :numeric_code, :active, :created_at)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($transformedData);

        $supplierId = $pdo->lastInsertId();

        sendSuccess(['id' => $supplierId], 'Supplier created successfully');
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
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

    // Validate code length if provided
    if (isset($data['code']) && $data['code']) {
        if (strlen($data['code']) < 3 || strlen($data['code']) > 5) {
            sendError("รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร", 400);
        }
    }

    // Validate email format
    if (isset($data['email']) && $data['email'] && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError("รูปแบบอีเมลไม่ถูกต้อง", 400);
    }

    // Handle address backward compatibility
    $addressLine1 = $data['address_line1'] ?? ($data['address'] ?? null);

    // Transform data
    $transformedData = transformToUpperCase([
        'name' => $data['name'],
        'code' => $data['code'] ?? null,
        'email' => isset($data['email']) ? strtolower($data['email']) : null, // email lowercase
        'address_line1' => $addressLine1,
        'address_line2' => $data['address_line2'] ?? null,
        'address_line3' => $data['address_line3'] ?? null,
        'id_number' => $data['id_number'] ?? null,
        'phone' => $data['phone'] ?? null,
        'credit_days' => $data['credit_days'] ?? 0,
        'branch_type' => $data['branch_type'] ?? 'Head Office',
        'branch_number' => ($data['branch_type'] === 'Branch') ? $data['branch_number'] : null,
        'active' => 1,
        'created_at' => getThaiTimestamp(),
        'updated_at' => getThaiTimestamp()
    ], ['email']); // exclude email from uppercase transform

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

    // Check if supplier exists
    $stmt = $pdo->prepare("SELECT id FROM information WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (!$stmt->fetch()) {
        sendError("Supplier not found", 404);
    }

    // Determine category
    $category = 'supplier-other';
    if ($data['type'] === 'Airline') {
        $category = 'airline';
    } elseif ($data['type'] === 'Voucher') {
        $category = 'supplier-voucher';
    }

    $transformedData = transformToUpperCase([
        'category' => $category,
        'code' => $data['code'],
        'name' => $data['name'],
        'type' => $data['type'],
        'numeric_code' => $data['numeric_code'] ?? null
    ]);
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

/**
 * Update customer
 */
function updateCustomer($id, $data)
{
    validateRequired($data, ['name']);

    $pdo = getDB();

    // Check if customer exists
    $stmt = $pdo->prepare("SELECT id FROM customers WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (!$stmt->fetch()) {
        sendError("Customer not found", 404);
    }

    // Validation (same as create)
    if (isset($data['code']) && $data['code']) {
        if (strlen($data['code']) < 3 || strlen($data['code']) > 5) {
            sendError("รหัสลูกค้าต้องเป็น 3-5 ตัวอักษร", 400);
        }
    }

    if (isset($data['email']) && $data['email'] && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError("รูปแบบอีเมลไม่ถูกต้อง", 400);
    }

    $addressLine1 = $data['address_line1'] ?? ($data['address'] ?? null);

    $transformedData = transformToUpperCase([
        'name' => $data['name'],
        'code' => $data['code'] ?? null,
        'email' => isset($data['email']) ? strtolower($data['email']) : null,
        'address_line1' => $addressLine1,
        'address_line2' => $data['address_line2'] ?? null,
        'address_line3' => $data['address_line3'] ?? null,
        'id_number' => $data['id_number'] ?? null,
        'phone' => $data['phone'] ?? null,
        'credit_days' => $data['credit_days'] ?? 0,
        'branch_type' => $data['branch_type'] ?? 'Head Office',
        'branch_number' => ($data['branch_type'] === 'Branch') ? $data['branch_number'] : null,
        'updated_at' => getThaiTimestamp()
    ], ['email']);
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
 * Deactivate supplier (soft delete)
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
 * Deactivate customer (soft delete)
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
