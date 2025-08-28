<?php
// backend/apis/showtimes/by-movie.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../db/config.php'; // CHỈNH path nếu khác
if (!isset($conn) || !($conn instanceof mysqli)) { http_response_code(500); echo json_encode(['ok'=>false,'message'=>'DB not found']); exit; }
$conn->set_charset('utf8mb4');

$movie_id = isset($_GET['movie_id']) ? (int)$_GET['movie_id'] : 0;
$date     = isset($_GET['date']) ? trim($_GET['date']) : ''; // YYYY-MM-DD optional
if ($movie_id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'message'=>'movie_id required']); exit; }

if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
  http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Invalid date']); exit;
}

if ($date === '') {
  $from = date('Y-m-d 00:00:00');
  $to   = date('Y-m-d 23:59:59', strtotime('+7 days'));
} else {
  $from = $date.' 00:00:00';
  $to   = $date.' 23:59:59';
}

$sql = "SELECT s.id, s.start_time, s.end_time, s.base_price, s.status,
               r.id AS room_id, r.name AS room_name,
               c.id AS cinema_id, c.name AS cinema_name
        FROM showtimes s
        JOIN rooms r   ON r.id = s.room_id
        JOIN cinemas c ON c.id = r.cinema_id
        WHERE s.movie_id = ? AND s.status='open' AND s.start_time BETWEEN ? AND ?
        ORDER BY s.start_time ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('iss', $movie_id, $from, $to);
if (!$stmt->execute()) { http_response_code(500); echo json_encode(['ok'=>false,'message'=>'DB execute failed']); exit; }

$res  = $stmt->get_result();
$data = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();

echo json_encode(['ok'=>true,'data'=>$data], JSON_UNESCAPED_UNICODE);
