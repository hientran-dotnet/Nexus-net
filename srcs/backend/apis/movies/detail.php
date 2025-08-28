<?php
// backend/apis/movies/detail.php
header('Content-Type: application/json; charset=utf-8');
// Nếu FE và BE khác origin, bật CORS khi cần:
// header('Access-Control-Allow-Origin: https://itdi.io.vn');
// header('Access-Control-Allow-Credentials: true');

require_once __DIR__ . '/../../db/config.php'; // CHỈNH path nếu config ở chỗ khác
if (!isset($conn) || !($conn instanceof mysqli)) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'DB connection not found']); exit;
}
$conn->set_charset('utf8mb4');

$id   = isset($_GET['id'])   ? (int)$_GET['id'] : 0;
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

if ($id <= 0 && $slug === '') {
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>'Provide id or slug']); exit;
}

if ($id > 0) {
  $sql = "SELECT id,title,slug,original_title,description,duration_min,age_rating,language,
                 country,release_date,poster_url,backdrop_url,trailer_url,status
          FROM movies WHERE id=? LIMIT 1";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('i', $id);
} else {
  $sql = "SELECT id,title,slug,original_title,description,duration_min,age_rating,language,
                 country,release_date,poster_url,backdrop_url,trailer_url,status
          FROM movies WHERE slug=? LIMIT 1";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('s', $slug);
}

if (!$stmt->execute()) { http_response_code(500); echo json_encode(['ok'=>false,'message'=>'DB execute failed']); exit; }
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

if (!$row) { http_response_code(404); echo json_encode(['ok'=>false,'message'=>'Movie not found']); exit; }

echo json_encode(['ok'=>true,'data'=>$row], JSON_UNESCAPED_UNICODE);
