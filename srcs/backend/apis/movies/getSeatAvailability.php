<?php
// backend/apis/showtimes/getSeatAvailability.php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Debug: Log request
error_log("getSeatAvailability.php called with: " . json_encode($_GET));

try {
    require_once __DIR__ . '/../../db/config.php';
} catch (Exception $e) {
    echo json_encode([
        'ok' => false, 
        'message' => 'Database connection failed',
        'error' => $e->getMessage(),
        'debug' => 'Failed to include config.php'
    ]);
    exit;
}

// Validate input
$showtimeId = isset($_GET['showtime_id']) ? (int)$_GET['showtime_id'] : 0;
if ($showtimeId <= 0) {
    echo json_encode([
        'ok' => false, 
        'message' => 'Thiếu showtime_id hoặc showtime_id không hợp lệ',
        'debug' => 'showtime_id: ' . $showtimeId
    ]);
    exit;
}

try {
    // Check if using MySQLi or PDO
    $usingMySQLi = isset($conn) && ($conn instanceof mysqli);
    $usingPDO = isset($conn) && ($conn instanceof PDO);
    
    if (!$usingMySQLi && !$usingPDO) {
        echo json_encode([
            'ok' => false, 
            'message' => 'Database connection not established',
            'debug' => 'No valid connection found'
        ]);
        exit;
    }

    // 1. Kiểm tra showtime có tồn tại không
    if ($usingMySQLi) {
        $checkShowtime = "SELECT id, auditorium_id, movie_id FROM showtimes WHERE id = ?";
        $stmt = $conn->prepare($checkShowtime);
        if (!$stmt) {
            echo json_encode([
                'ok' => false, 
                'message' => 'Failed to prepare showtime query',
                'debug' => ['error' => $conn->error]
            ]);
            exit;
        }
        
        $stmt->bind_param('i', $showtimeId);
        $executeResult = $stmt->execute();
        if (!$executeResult) {
            echo json_encode([
                'ok' => false, 
                'message' => 'Failed to execute showtime query',
                'debug' => ['error' => $stmt->error]
            ]);
            exit;
        }
        
        $result = $stmt->get_result();
        $showtime = $result->fetch_assoc();
        $stmt->close();
    } else {
        // PDO version (từ code cũ)
        $checkShowtime = "SELECT id, auditorium_id, movie_id FROM showtimes WHERE id = ?";
        $stmt = $conn->prepare($checkShowtime);
        $stmt->execute([$showtimeId]);
        $showtime = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$showtime) {
        // Debug: Check if showtimes table exists and has data
        if ($usingMySQLi) {
            $debugQuery = "SELECT COUNT(*) as count FROM showtimes";
            $debugResult = $conn->query($debugQuery);
            $debugData = $debugResult ? $debugResult->fetch_assoc() : ['count' => 'query failed'];
        } else {
            $debugQuery = "SELECT COUNT(*) as count FROM showtimes";
            $debugStmt = $conn->prepare($debugQuery);
            $debugStmt->execute();
            $debugData = $debugStmt->fetch(PDO::FETCH_ASSOC);
        }
        
        echo json_encode([
            'ok' => false, 
            'message' => 'Không tìm thấy suất chiếu',
            'debug' => [
                'showtime_id' => $showtimeId,
                'total_showtimes' => $debugData['count'],
                'connection_type' => $usingMySQLi ? 'MySQLi' : 'PDO'
            ]
        ]);
        exit;
    }
    
    error_log("Showtime found: " . json_encode($showtime));
    
    // 2. Kiểm tra auditorium có tồn tại không
    if ($usingMySQLi) {
        $auditoriumQuery = "SELECT id, name, total_rows, total_cols FROM auditoriums WHERE id = ?";
        $stmt = $conn->prepare($auditoriumQuery);
        if (!$stmt) {
            echo json_encode([
                'ok' => false, 
                'message' => 'Failed to prepare auditorium query',
                'debug' => ['error' => $conn->error]
            ]);
            exit;
        }
        
        $stmt->bind_param('i', $showtime['auditorium_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $auditorium = $result->fetch_assoc();
        $stmt->close();
    } else {
        $auditoriumQuery = "SELECT id, name, total_rows, total_cols FROM auditoriums WHERE id = ?";
        $stmt = $conn->prepare($auditoriumQuery);
        $stmt->execute([$showtime['auditorium_id']]);
        $auditorium = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$auditorium) {
        echo json_encode([
            'ok' => false, 
            'message' => 'Không tìm thấy phòng chiếu',
            'debug' => [
                'auditorium_id' => $showtime['auditorium_id'],
                'showtime' => $showtime
            ]
        ]);
        exit;
    }
    
    error_log("Auditorium found: " . json_encode($auditorium));
    
    // 3. Tạo bảng seats nếu chưa có và generate data
    createSeatsTableAndData($conn, $auditorium, $usingMySQLi);
    
    // 4. Lấy tất cả ghế của phòng chiếu
    if ($usingMySQLi) {
        $seatsQuery = "
            SELECT 
                s.id,
                s.row_no,
                s.col_no,
                s.seat_code,
                s.auditorium_id,
                CASE 
                    WHEN b.seat_id IS NOT NULL THEN 'occupied'
                    ELSE 'available'
                END as status
            FROM seats s
            LEFT JOIN (
                SELECT DISTINCT seat_id 
                FROM bookings 
                WHERE showtime_id = ? 
                AND status IN ('confirmed', 'paid')
            ) b ON s.id = b.seat_id
            WHERE s.auditorium_id = ?
            ORDER BY s.row_no, s.col_no
        ";
        
        $stmt = $conn->prepare($seatsQuery);
        if (!$stmt) {
            echo json_encode([
                'ok' => false, 
                'message' => 'Failed to prepare seats query',
                'debug' => ['error' => $conn->error]
            ]);
            exit;
        }
        
        $stmt->bind_param('ii', $showtimeId, $showtime['auditorium_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $seats = [];
        while ($row = $result->fetch_assoc()) {
            $seats[] = $row;
        }
        $stmt->close();
    } else {
        // PDO version
        $seatsQuery = "
            SELECT 
                s.id,
                s.row_no,
                s.col_no,
                s.seat_code,
                s.auditorium_id,
                CASE 
                    WHEN b.seat_id IS NOT NULL THEN 'occupied'
                    ELSE 'available'
                END as status
            FROM seats s
            LEFT JOIN (
                SELECT DISTINCT seat_id 
                FROM bookings 
                WHERE showtime_id = ? 
                AND status IN ('confirmed', 'paid')
            ) b ON s.id = b.seat_id
            WHERE s.auditorium_id = ?
            ORDER BY s.row_no, s.col_no
        ";
        
        $stmt = $conn->prepare($seatsQuery);
        $stmt->execute([$showtimeId, $showtime['auditorium_id']]);
        $seats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    error_log("Seats found: " . count($seats));
    
    // 5. Format dữ liệu cho frontend
    $seatMap = [];
    foreach ($seats as $seat) {
        $rowLetter = chr(64 + $seat['row_no']); // 1=A, 2=B, etc.
        $seatId = $rowLetter . $seat['col_no'];
        
        // Xác định loại ghế (VIP cho 4 hàng cuối)
        $isVip = $seat['row_no'] > ($auditorium['total_rows'] - 4);
        
        $seatMap[] = [
            'id' => $seat['id'],
            'seat_id' => $seatId,
            'row' => $rowLetter,
            'col' => $seat['col_no'],
            'row_no' => $seat['row_no'],
            'col_no' => $seat['col_no'],
            'seat_code' => $seat['seat_code'] ?? $seatId,
            'status' => $seat['status'],
            'type' => $isVip ? 'vip' : 'normal',
            'price' => $isVip ? 100000 : 75000
        ];
    }
    
    $response = [
        'ok' => true,
        'showtime_id' => $showtimeId,
        'auditorium' => [
            'id' => $showtime['auditorium_id'],
            'name' => $auditorium['name'] ?? 'Phòng chiếu',
            'total_rows' => (int)$auditorium['total_rows'],
            'total_cols' => (int)$auditorium['total_cols']
        ],
        'seats' => $seatMap,
        'debug' => [
            'total_seats' => count($seatMap),
            'connection_type' => $usingMySQLi ? 'MySQLi' : 'PDO'
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'ok' => false, 
        'message' => 'Error: ' . $e->getMessage(),
        'debug' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}

function createSeatsTableAndData($conn, $auditorium, $usingMySQLi) {
    // Tạo bảng seats nếu chưa có
    $createSeatsTable = "
        CREATE TABLE IF NOT EXISTS `seats` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `auditorium_id` int(11) NOT NULL,
          `row_no` int(11) NOT NULL,
          `col_no` int(11) NOT NULL,
          `seat_code` varchar(10) NOT NULL,
          `status` enum('active','inactive') DEFAULT 'active',
          `created_at` datetime DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          UNIQUE KEY `unique_seat` (`auditorium_id`, `row_no`, `col_no`),
          KEY `idx_auditorium` (`auditorium_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    if ($usingMySQLi) {
        $conn->query($createSeatsTable);
        
        // Check if seats exist for this auditorium
        $checkSeats = "SELECT COUNT(*) as count FROM seats WHERE auditorium_id = " . $auditorium['id'];
        $result = $conn->query($checkSeats);
        $row = $result->fetch_assoc();
        
        if ($row['count'] == 0) {
            // Generate seats
            generateSeatsForAuditoriumMySQLi($conn, $auditorium);
        }
    } else {
        $conn->exec($createSeatsTable);
        
        $checkSeats = "SELECT COUNT(*) as count FROM seats WHERE auditorium_id = ?";
        $stmt = $conn->prepare($checkSeats);
        $stmt->execute([$auditorium['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row['count'] == 0) {
            generateSeatsForAuditoriumPDO($conn, $auditorium);
        }
    }
}

function generateSeatsForAuditoriumMySQLi($conn, $auditorium) {
    $auditoriumId = $auditorium['id'];
    $totalRows = $auditorium['total_rows'];
    $totalCols = $auditorium['total_cols'];
    
    $insertQuery = "INSERT INTO seats (auditorium_id, row_no, col_no, seat_code) VALUES (?, ?, ?, ?)";

    for ($row = 1; $row <= $totalRows; $row++) {
        for ($col = 1; $col <= $totalCols; $col++) {
            $rowLetter = chr(64 + $row);
            $seatCode = $rowLetter . $col;
            
            $conn->query($insertQuery, [$auditoriumId, $row, $col, $seatCode]);
        }
    }
}

function generateSeatsForAuditoriumPDO($conn, $auditorium) {
    $auditoriumId = $auditorium['id'];
    $totalRows = $auditorium['total_rows'];
    $totalCols = $auditorium['total_cols'];
    
    $insertQuery = "INSERT INTO seats (auditorium_id, row_no, col_no, seat_code) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);
    
    for ($row = 1; $row <= $totalRows; $row++) {
        for ($col = 1; $col <= $totalCols; $col++) {
            $rowLetter = chr(64 + $row);
            $seatCode = $rowLetter . $col;
            
            $stmt->execute([$auditoriumId, $row, $col, $seatCode]);
        }
    }
}
?>
