<?php
// backend/apis/movies/list.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../db/config.php'; // chỉnh path nếu bạn để config chỗ khác

// Nhận tham số
$status        = isset($_GET['status']) ? trim($_GET['status']) : ''; // now_showing|coming_soon|inactive
$limit         = isset($_GET['limit'])  ? (int)$_GET['limit'] : 8;    // mặc định 8
$with_backdrop = isset($_GET['with_backdrop']) ? (int)$_GET['with_backdrop'] : 1;
$order         = isset($_GET['order']) ? trim($_GET['order']) : 'release_desc'; // release_desc|created_desc|rating_desc

// Ràng buộc an toàn
$allowedStatus = ['now_showing','coming_soon','inactive'];
if ($status !== '' && !in_array($status, $allowedStatus, true)) { $status = ''; }

if ($limit < 1)  $limit = 1;
if ($limit > 50) $limit = 50;

$allowedOrder = [
  'release_desc' => 'COALESCE(release_date, "1000-01-01") DESC, id DESC',
  'created_desc' => 'created_at DESC, id DESC',
  'rating_desc'  => 'rating_avg DESC, rating_count DESC, id DESC'
];
$orderBy = $allowedOrder[$order] ?? $allowedOrder['release_desc'];

// Xây câu lệnh
$sql = "SELECT id, title, original_title, description, duration_min, age_rating,
               language, country, release_date, poster_url, backdrop_url, trailer_url, status
        FROM movies WHERE 1=1";

if ($status !== '') {
  $sql .= " AND status = ?";
}
if ($with_backdrop === 1) {
  $sql .= " AND backdrop_url IS NOT NULL AND backdrop_url <> ''";
}
$sql .= " ORDER BY $orderBy LIMIT ?";

$stmt = null;
if ($status !== '') {
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("si", $status, $limit);
} else {
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $limit);
}

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'DB error']); exit;
}

$res = $stmt->get_result();
$data = [];
while ($row = $res->fetch_assoc()) {
  // Có thể chuẩn hoá thêm ở đây nếu muốn
  $data[] = $row;
}
$stmt->close();

echo json_encode(['ok'=>true, 'data'=>$data], JSON_UNESCAPED_UNICODE);
