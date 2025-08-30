<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../db/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    $showtimeId = $_GET['showtimeId'] ?? null;
    
    if (!$showtimeId) {
        throw new Exception('Showtime ID is required', 400);
    }
    
    // Validate showtime ID is numeric
    if (!is_numeric($showtimeId)) {
        throw new Exception('Invalid showtime ID format', 400);
    }
    
    // Connect to database using MySQLi
    $mysqli = new mysqli($host, $username, $password, $database);
    
    // Check connection
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed: ' . $mysqli->connect_error, 500);
    }
    
    // Set charset
    $mysqli->set_charset('utf8mb4');
    
    // Get occupied seats for this showtime
    $occupiedQuery = "
        SELECT DISTINCT bs.seat_id 
        FROM booking_seats bs
        JOIN bookings b ON bs.booking_id = b.id
        WHERE b.showtime_id = ? 
        AND b.status IN ('confirmed', 'paid')
        AND b.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ";
    
    $stmt1 = $mysqli->prepare($occupiedQuery);
    if (!$stmt1) {
        throw new Exception('Failed to prepare occupied seats query: ' . $mysqli->error, 500);
    }
    
    $stmt1->bind_param('i', $showtimeId);
    
    if (!$stmt1->execute()) {
        throw new Exception('Failed to execute occupied seats query: ' . $stmt1->error, 500);
    }
    
    $result1 = $stmt1->get_result();
    $occupiedSeats = [];
    
    while ($row = $result1->fetch_assoc()) {
        $occupiedSeats[] = $row['seat_id'];
    }
    
    $stmt1->close();
    
    // Get temporarily reserved seats (last 15 minutes)
    $reservedQuery = "
        SELECT DISTINCT seat_id 
        FROM seat_reservations 
        WHERE showtime_id = ? 
        AND expires_at > NOW()
    ";
    
    $stmt2 = $mysqli->prepare($reservedQuery);
    if (!$stmt2) {
        throw new Exception('Failed to prepare reserved seats query: ' . $mysqli->error, 500);
    }
    
    $stmt2->bind_param('i', $showtimeId);
    
    if (!$stmt2->execute()) {
        throw new Exception('Failed to execute reserved seats query: ' . $stmt2->error, 500);
    }
    
    $result2 = $stmt2->get_result();
    $reservedSeats = [];
    
    while ($row = $result2->fetch_assoc()) {
        $reservedSeats[] = $row['seat_id'];
    }
    
    $stmt2->close();
    
    // Close database connection
    $mysqli->close();
    
    // Combine occupied and reserved seats
    $unavailableSeats = array_unique(array_merge($occupiedSeats, $reservedSeats));
    
    // Sort the seats for consistent output
    sort($unavailableSeats);
    
    echo json_encode([
        'ok' => true,
        'occupiedSeats' => $unavailableSeats,
        'totalOccupied' => count($occupiedSeats),
        'totalReserved' => count($reservedSeats),
        'totalUnavailable' => count($unavailableSeats),
        'message' => 'Seat availability retrieved successfully'
    ]);
    
} catch (Exception $e) {
    // Make sure to close connection if it exists
    if (isset($mysqli) && $mysqli instanceof mysqli) {
        $mysqli->close();
    }
    
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage(),
        'showtimeId' => $showtimeId ?? null
    ]);
} catch (mysqli_sql_exception $e) {
    // Handle MySQLi specific exceptions
    if (isset($mysqli) && $mysqli instanceof mysqli) {
        $mysqli->close();
    }
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'showtimeId' => $showtimeId ?? null
    ]);
}
?>