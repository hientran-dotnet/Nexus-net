<?php
// backend/apis/movies/showtimes.php  (MySQLi version)

// CORS (nếu frontend chạy khác origin)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

header('Content-Type: application/json; charset=utf-8');

// Kết nối DB (MySQLi) – giữ nguyên biến $conn từ config.php của bạn
require_once __DIR__ . '/../../db/config.php';

// Ép MySQLi ném exception để bắt lỗi gọn (tùy server)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$movieId = isset($_GET['movie_id']) ? (int)$_GET['movie_id'] : 0;
$date    = isset($_GET['date']) ? trim($_GET['date']) : date('Y-m-d');

if ($movieId <= 0) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Thiếu movie_id'], JSON_UNESCAPED_UNICODE);
  exit;
}

$startOfDay = $date . ' 00:00:00';
$endOfDay   = $date . ' 23:59:59';

try {
  $sql = "
    SELECT
      st.id,
      st.starts_at,
      st.ends_at,
      st.base_price,
      a.name  AS auditorium_name,
      m.title AS movie_title
    FROM showtimes st
    JOIN auditoriums a ON st.auditorium_id = a.id
    JOIN movies      m ON st.movie_id      = m.id
    WHERE st.movie_id = ?
      AND st.starts_at BETWEEN ? AND ?
    ORDER BY st.starts_at ASC
  ";

  $stmt = $conn->prepare($sql);
  // i = integer (movie_id), s = string (start, end)
  $stmt->bind_param("iss", $movieId, $startOfDay, $endOfDay);
  $stmt->execute();

  // Lấy dữ liệu
  $result = $stmt->get_result(); // yêu cầu mysqlnd (thường có sẵn trên XAMPP)
  $rows = $result->fetch_all(MYSQLI_ASSOC);
  $stmt->close();

  echo json_encode(['ok' => true, 'showtimes' => $rows], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Lỗi server: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
