<?php
// api/tickets.php - Tickets API for SaleTicket functionality

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
    logError("Tickets API Error", ['error' => $e->getMessage(), 'action' => $action]);
    sendError("Internal server error: " . $e->getMessage(), 500);
}

/**
 * Handle GET requests
 */
function handleGet($action, $params)
{
    switch ($action) {
        case 'get_flight':
            getFlightTicket($params['id'] ?? null);
            break;
        case 'list_flights':
            getFlightTickets($params);
            break;
        case 'generate_reference':
            generateReferenceNumber();
            break;
        default:
            sendError("Invalid action for GET", 400);
    }
}

/**
 * Handle POST requests
 */
function handlePost($action, $input)
{
    switch ($action) {
        case 'create_flight':
            createFlightTicket($input);
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
        case 'update_flight':
            updateFlightTicket($id, $input);
            break;
        case 'cancel':
            cancelFlightTicket($id, $input);
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
        case 'delete':
            deleteFlightTicket($id);
            break;
        default:
            sendError("Invalid action for DELETE", 400);
    }
}

// ===== TICKET FUNCTIONS =====

/**
 * Create new flight ticket
 */
function createFlightTicket($input)
{
    $pdo = getDB();

    try {
        $pdo->beginTransaction();

        // Validate required fields
        validateRequired($input, ['customer_id', 'information_id']);

        // Generate reference number if not provided
        $referenceNumber = $input['reference_number'] ?? generateTicketReference();

        // 1. Insert main ticket record
        $stmt = $pdo->prepare("
            INSERT INTO bookings_ticket (
                reference_number, customer_id, information_id, status, 
                payment_status, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $stmt->execute([
            $referenceNumber,
            $input['customer_id'],
            $input['information_id'],
            'not_invoiced',
            'pending',
            $input['created_by'] ?? null
        ]);

        $ticketId = $pdo->lastInsertId();

        // 2. Insert ticket details
        if (isset($input['ticket_details'])) {
            $details = $input['ticket_details'];
            $stmt = $pdo->prepare("
                INSERT INTO tickets_detail (
                    bookings_ticket_id, issue_date, due_date, credit_days,
                    subtotal_before_vat, extras_total, pricing_total,
                    vat_amount, vat_percent, grand_total, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $ticketId,
                $details['issue_date'] ?? date('Y-m-d'),
                $details['due_date'] ?? date('Y-m-d'),
                $details['credit_days'] ?? 0,
                $details['subtotal_before_vat'] ?? 0,
                $details['extras_total'] ?? 0,
                $details['pricing_total'] ?? 0,
                $details['vat_amount'] ?? 0,
                $details['vat_percent'] ?? 0,
                $details['grand_total'] ?? 0
            ]);
        }

        // 3. Insert additional info
        if (isset($input['additional_info'])) {
            $additional = $input['additional_info'];
            $stmt = $pdo->prepare("
                INSERT INTO ticket_additional_info (
                    bookings_ticket_id, company_payment_method, company_payment_details,
                    customer_payment_method, customer_payment_details, code,
                    ticket_type, ticket_type_details, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $ticketId,
                $additional['company_payment_method'] ?? null,
                $additional['company_payment_details'] ?? null,
                $additional['customer_payment_method'] ?? null,
                $additional['customer_payment_details'] ?? null,
                $additional['code'] ?? null,
                $additional['ticket_type'] ?? 'bsp',
                $additional['ticket_type_details'] ?? null
            ]);
        }

        // 4. Insert passengers
        if (isset($input['passengers']) && is_array($input['passengers'])) {
            $stmt = $pdo->prepare("
                INSERT INTO tickets_passengers (
                    bookings_ticket_id, passenger_name, age, ticket_number,
                    ticket_code, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ");

            foreach ($input['passengers'] as $passenger) {
                $stmt->execute([
                    $ticketId,
                    $passenger['passenger_name'] ?? '',
                    $passenger['age'] ?? null,
                    $passenger['ticket_number'] ?? null,
                    $passenger['ticket_code'] ?? null
                ]);
            }
        }

        // 5. Insert pricing
        if (isset($input['pricing'])) {
            $pricing = $input['pricing'];
            $stmt = $pdo->prepare("
                INSERT INTO tickets_pricing (
                    bookings_ticket_id, adult_net_price, adult_sale_price, adult_pax, adult_total,
                    child_net_price, child_sale_price, child_pax, child_total,
                    infant_net_price, infant_sale_price, infant_pax, infant_total,
                    subtotal_amount, vat_percent, vat_amount, total_amount, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $ticketId,
                $pricing['adult_net_price'] ?? 0,
                $pricing['adult_sale_price'] ?? 0,
                $pricing['adult_pax'] ?? 0,
                $pricing['adult_total'] ?? 0,
                $pricing['child_net_price'] ?? 0,
                $pricing['child_sale_price'] ?? 0,
                $pricing['child_pax'] ?? 0,
                $pricing['child_total'] ?? 0,
                $pricing['infant_net_price'] ?? 0,
                $pricing['infant_sale_price'] ?? 0,
                $pricing['infant_pax'] ?? 0,
                $pricing['infant_total'] ?? 0,
                $pricing['subtotal_amount'] ?? 0,
                $pricing['vat_percent'] ?? 0,
                $pricing['vat_amount'] ?? 0,
                $pricing['total_amount'] ?? 0
            ]);
        }

        // 6. Insert routes
        if (isset($input['routes']) && is_array($input['routes'])) {
            $stmt = $pdo->prepare("
                INSERT INTO tickets_routes (
                    bookings_ticket_id, flight_number, rbd, date, origin,
                    destination, departure_time, arrival_time, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            foreach ($input['routes'] as $route) {
                $stmt->execute([
                    $ticketId,
                    $route['flight_number'] ?? null,
                    $route['rbd'] ?? null,
                    $route['date'] ?? null,
                    $route['origin'] ?? null,
                    $route['destination'] ?? null,
                    $route['departure_time'] ?? null,
                    $route['arrival_time'] ?? null
                ]);
            }
        }

        // 7. Insert extras
        if (isset($input['extras']) && is_array($input['extras'])) {
            $stmt = $pdo->prepare("
                INSERT INTO tickets_extras (
                    bookings_ticket_id, description, net_price, sale_price,
                    quantity, total_amount, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            foreach ($input['extras'] as $extra) {
                if (!empty($extra['description'])) {
                    $stmt->execute([
                        $ticketId,
                        $extra['description'],
                        $extra['net_price'] ?? 0,
                        $extra['sale_price'] ?? 0,
                        $extra['quantity'] ?? 1,
                        $extra['total_amount'] ?? 0
                    ]);
                }
            }
        }

        $pdo->commit();

        sendSuccess([
            'ticket_id' => $ticketId,
            'reference_number' => $referenceNumber,
            'grand_total' => $input['ticket_details']['grand_total'] ?? 0,
            'subtotal' => $input['ticket_details']['subtotal_before_vat'] ?? 0,
            'vat_amount' => $input['ticket_details']['vat_amount'] ?? 0,
            'message' => 'Flight ticket created successfully'
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        logError("Create flight ticket error", ['error' => $e->getMessage(), 'input' => $input]);
        sendError("Failed to create flight ticket: " . $e->getMessage(), 500);
    }
}

/**
 * Get flight ticket by ID
 */
function getFlightTicket($id)
{
    if (!$id) {
        sendError("Ticket ID is required", 400);
    }

    $pdo = getDB();

    try {
        // Get main ticket data with relations
        $stmt = $pdo->prepare("
            SELECT 
                bt.*,
                c.name as customer_name, c.code as customer_code,
                i.name as supplier_name, i.code as supplier_code, i.numeric_code as supplier_numeric_code,
                td.*,
                tai.*
            FROM bookings_ticket bt
            LEFT JOIN customers c ON bt.customer_id = c.id
            LEFT JOIN information i ON bt.information_id = i.id
            LEFT JOIN tickets_detail td ON bt.id = td.bookings_ticket_id
            LEFT JOIN ticket_additional_info tai ON bt.id = tai.bookings_ticket_id
            WHERE bt.id = ?
        ");

        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            sendError("Ticket not found", 404);
        }

        // Get passengers
        $stmt = $pdo->prepare("SELECT * FROM tickets_passengers WHERE bookings_ticket_id = ?");
        $stmt->execute([$id]);
        $passengers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get routes
        $stmt = $pdo->prepare("SELECT * FROM tickets_routes WHERE bookings_ticket_id = ?");
        $stmt->execute([$id]);
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get pricing
        $stmt = $pdo->prepare("SELECT * FROM tickets_pricing WHERE bookings_ticket_id = ?");
        $stmt->execute([$id]);
        $pricing = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get extras
        $stmt = $pdo->prepare("SELECT * FROM tickets_extras WHERE bookings_ticket_id = ?");
        $stmt->execute([$id]);
        $extras = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Combine all data
        $result = [
            'ticket' => $ticket,
            'passengers' => $passengers ?: [],
            'routes' => $routes ?: [],
            'pricing' => $pricing ?: [],
            'extras' => $extras ?: []
        ];

        sendSuccess($result);
    } catch (Exception $e) {
        logError("Get flight ticket error", ['error' => $e->getMessage(), 'id' => $id]);
        sendError("Failed to get flight ticket: " . $e->getMessage(), 500);
    }
}

/**
 * Get flight tickets list with filters
 */
function getFlightTickets($params)
{
    $pdo = getDB();

    try {
        $page = max(1, intval($params['page'] ?? 1));
        $limit = min(100, max(1, intval($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        // Build WHERE conditions
        $conditions = [];
        $bindings = [];

        if (!empty($params['status'])) {
            $conditions[] = "bt.status = ?";
            $bindings[] = $params['status'];
        }

        if (!empty($params['payment_status'])) {
            $conditions[] = "bt.payment_status = ?";
            $bindings[] = $params['payment_status'];
        }

        if (!empty($params['customer_id'])) {
            $conditions[] = "bt.customer_id = ?";
            $bindings[] = $params['customer_id'];
        }

        if (!empty($params['from_date'])) {
            $conditions[] = "DATE(bt.created_at) >= ?";
            $bindings[] = $params['from_date'];
        }

        if (!empty($params['to_date'])) {
            $conditions[] = "DATE(bt.created_at) <= ?";
            $bindings[] = $params['to_date'];
        }

        if (!empty($params['referenceNumber'])) {
            $conditions[] = "bt.reference_number LIKE ?";
            $bindings[] = '%' . $params['referenceNumber'] . '%';
        }

        $whereClause = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

        // Get total count
        $countSql = "
            SELECT COUNT(*) as total
            FROM bookings_ticket bt
            $whereClause
        ";

        $stmt = $pdo->prepare($countSql);
        $stmt->execute($bindings);
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get data with pagination
        $sql = "
            SELECT 
                bt.*,
                c.name as customer_name,
                i.name as supplier_name,
                td.grand_total, td.issue_date, td.due_date
            FROM bookings_ticket bt
            LEFT JOIN customers c ON bt.customer_id = c.id
            LEFT JOIN information i ON bt.information_id = i.id
            LEFT JOIN tickets_detail td ON bt.id = td.bookings_ticket_id
            $whereClause
            ORDER BY bt.created_at DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([...$bindings, $limit, $offset]);
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendSuccess([
            'data' => $tickets,
            'total' => $total,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    } catch (Exception $e) {
        logError("Get flight tickets error", ['error' => $e->getMessage()]);
        sendError("Failed to get flight tickets: " . $e->getMessage(), 500);
    }
}

/**
 * Update flight ticket
 */
function updateFlightTicket($id, $input)
{
    if (!$id) {
        sendError("Ticket ID is required", 400);
    }

    $pdo = getDB();

    try {
        // Update main ticket
        $updateFields = [];
        $bindings = [];

        if (isset($input['status'])) {
            $updateFields[] = "status = ?";
            $bindings[] = $input['status'];
        }

        if (isset($input['payment_status'])) {
            $updateFields[] = "payment_status = ?";
            $bindings[] = $input['payment_status'];
        }

        if (isset($input['po_number'])) {
            $updateFields[] = "po_number = ?";
            $bindings[] = $input['po_number'];
        }

        if (isset($input['po_generated_at'])) {
            $updateFields[] = "po_generated_at = ?";
            $bindings[] = $input['po_generated_at'];
        }

        if ($updateFields) {
            $updateFields[] = "updated_at = NOW()";
            $bindings[] = $id;

            $sql = "UPDATE bookings_ticket SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($bindings);
        }

        sendSuccess(['message' => 'Ticket updated successfully']);
    } catch (Exception $e) {
        logError("Update flight ticket error", ['error' => $e->getMessage(), 'id' => $id]);
        sendError("Failed to update flight ticket: " . $e->getMessage(), 500);
    }
}

/**
 * Cancel flight ticket
 */
function cancelFlightTicket($id, $input)
{
    if (!$id) {
        sendError("Ticket ID is required", 400);
    }

    $pdo = getDB();

    try {
        $stmt = $pdo->prepare("
            UPDATE bookings_ticket 
            SET status = 'cancelled', 
                cancelled_at = NOW(),
                cancel_reason = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $input['reason'] ?? '',
            $id
        ]);

        sendSuccess(['message' => 'Ticket cancelled successfully']);
    } catch (Exception $e) {
        logError("Cancel flight ticket error", ['error' => $e->getMessage(), 'id' => $id]);
        sendError("Failed to cancel flight ticket: " . $e->getMessage(), 500);
    }
}

/**
 * Generate reference number
 */
function generateReferenceNumber()
{
    try {
        $referenceNumber = generateTicketReference();
        sendSuccess([
            'reference_number' => $referenceNumber
        ]);
    } catch (Exception $e) {
        logError("Generate reference error", ['error' => $e->getMessage()]);
        sendError("Failed to generate reference number: " . $e->getMessage(), 500);
    }
}

/**
 * Generate ticket reference number
 */
function generateTicketReference()
{
    $pdo = getDB();

    // Get current year (2 digits)
    $year = date('y'); // 25 สำหรับปี 2025
    $prefix = "FT";

    try {
        // ค้นหา reference number ล่าสุดของปีปัจจุบัน
        $stmt = $pdo->prepare("
            SELECT reference_number 
            FROM bookings_ticket 
            WHERE reference_number LIKE ? 
            ORDER BY reference_number DESC 
            LIMIT 1
        ");

        $pattern = "{$prefix}-{$year}-%"; // FT-25-%
        $stmt->execute([$pattern]);
        $lastRef = $stmt->fetch(PDO::FETCH_ASSOC);

        $batch = 1;      // เริ่มต้น batch = 1
        $sequence = 1;   // เริ่มต้น sequence = 1 (จะกลายเป็น 0001)

        if ($lastRef) {
            // แยกส่วนประกอบ: FT-25-1-0019 -> ['FT', '25', '1', '0019']
            $parts = explode('-', $lastRef['reference_number']);

            if (count($parts) >= 4) {
                $lastYear = $parts[1];  // 25
                $lastBatch = intval($parts[2]); // 1
                $lastSequence = intval($parts[3]); // 19

                // ถ้าปีเดียวกัน
                if ($lastYear === $year) {
                    // ถ้า sequence ยังไม่ถึง 9999
                    if ($lastSequence < 9999) {
                        $batch = $lastBatch;
                        $sequence = $lastSequence + 1;
                    }
                    // ถ้า sequence ถึง 9999 แล้ว ให้เพิ่ม batch และ reset sequence
                    else {
                        $batch = $lastBatch + 1;
                        $sequence = 1;
                    }
                }
                // ถ้าเปลี่ยนปีแล้ว ให้เริ่มใหม่
                else {
                    $batch = 1;
                    $sequence = 1;
                }
            }
        }

        // สร้าง reference number: FT-25-1-0001
        $referenceNumber = sprintf("%s-%s-%d-%04d", $prefix, $year, $batch, $sequence);

        return $referenceNumber;
    } catch (Exception $e) {
        // ในกรณี error ให้สร้างแบบ fallback
        $timestamp = time();
        return "{$prefix}-{$year}-1-" . str_pad(($timestamp % 9999) + 1, 4, '0', STR_PAD_LEFT);
    }
}

/**
 * Delete flight ticket (soft delete)
 */
function deleteFlightTicket($id)
{
    if (!$id) {
        sendError("Ticket ID is required", 400);
    }

    $pdo = getDB();

    try {
        $stmt = $pdo->prepare("
            UPDATE bookings_ticket 
            SET status = 'deleted', updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        sendSuccess(['message' => 'Ticket deleted successfully']);
    } catch (Exception $e) {
        logError("Delete flight ticket error", ['error' => $e->getMessage(), 'id' => $id]);
        sendError("Failed to delete flight ticket: " . $e->getMessage(), 500);
    }
}
