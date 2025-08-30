<?php
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
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $showtimeId = $input['showtimeId'] ?? null;
    $seatIds = $input['seatIds'] ?? [];
    $expiresAt = $input['expiresAt'] ?? null;
    
    if (!$showtimeId || empty($seatIds) || !$expiresAt) {
        throw new Exception('Missing required fields', 400);
    }
    
    // Connect to database
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Check if seats are already occupied or reserved
        $placeholders = str_repeat('?,', count($seatIds) - 1) . '?';
        $stmt = $pdo->prepare("
            SELECT seat_id FROM seat_reservations 
            WHERE showtime_id = ? 
            AND seat_id IN ($placeholders) 
            AND expires_at > NOW()
        ");
        
        $params = array_merge([$showtimeId], $seatIds);
        $stmt->execute($params);
        $alreadyReserved = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($alreadyReserved)) {
            throw new Exception('Some seats are already reserved: ' . implode(', ', $alreadyReserved), 409);
        }
        
        // Clear expired reservations
        $stmt = $pdo->prepare("DELETE FROM seat_reservations WHERE expires_at <= NOW()");
        $stmt->execute();
        
        // Create new reservations
        $stmt = $pdo->prepare("
            INSERT INTO seat_reservations (showtime_id, seat_id, session_id, expires_at, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $sessionId = session_id() ?: uniqid();
        
        foreach ($seatIds as $seatId) {
            $stmt->execute([$showtimeId, $seatId, $sessionId, $expiresAt]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            'ok' => true,
            'message' => 'Seats reserved successfully',
            'sessionId' => $sessionId,
            'expiresAt' => $expiresAt
        ]);
        
    } catch (Exception $e) {
        $pdo->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
?>