<?php
// backend/apis/movies/list.php
header('Content-Type: application/json; charset=utf-8');

// Bật debug khi cần: .../list.php?...&debug=1
$debug = isset($_GET['debug']) ? 1 : 0;
if ($debug) { ini_set('display_errors', 1); error_reporting(E_ALL); }

require_once __DIR__ . '/../../db/config.php'; // <-- CHỈNH LẠI nếu config của bạn không ở /db/

if (!isset($conn) || !($conn instanceof mysqli)) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'DB connection not found ($conn). Check config include path.'], JSON_UNESCAPED_UNICODE);
  exit;
}
$conn->set_charset('utf8mb4');

// ---- Inputs ----
$limit         = isset($_GET['limit'])  ? (int)$_GET['limit']  : 20;
$offset        = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$with_backdrop = isset($_GET['with_backdrop']) ? (int)$_GET['with_backdrop'] : 0;
$order         = isset($_GET['order']) ? trim($_GET['order']) : 'release_desc';
$status        = isset($_GET['status']) ? trim($_GET['status']) : ''; // optional

// Ràng buộc
if ($limit < 1)  $limit = 1;
if ($limit > 100) $limit = 100;
if ($offset < 0) $offset = 0;

$orderMap = [
  'release_desc' => 'COALESCE(release_date, "1000-01-01") DESC, id DESC',
  'created_desc' => 'created_at DESC, id DESC',
  'rating_desc'  => 'rating_avg DESC, rating_count DESC, id DESC', // dùng khi có cột rating_*
];
$orderBy = $orderMap[$order] ?? $orderMap['release_desc'];

$allowedStatus = ['now_showing','coming_soon','inactive'];

// ---- Build SQL ----
$sql = "SELECT id, title, slug, description, duration_min, poster_url, backdrop_url
        FROM movies
        WHERE 1=1";

$types  = '';
$params = [];

if ($status !== '') {
  if (!in_array($status, $allowedStatus, true)) {
    http_response_code(400);
    echo json_encode(['ok'=>false,'message'=>'Invalid status'], JSON_UNESCAPED_UNICODE);
    exit;
  }
  $sql   .= " AND status = ?";
  $types .= 's';
  $params[] = $status;
} else {
  // Mặc định ẩn inactive
  $sql .= " AND status IN ('now_showing','coming_soon')";
}

if ($with_backdrop === 1) {
  $sql .= " AND backdrop_url IS NOT NULL AND backdrop_url <> ''";
}

$sql   .= " ORDER BY $orderBy LIMIT ? OFFSET ?";
$types .= 'ii';
$params[] = $limit;
$params[] = $offset;

// ---- Prepare/Execute ----
$stmt = $conn->prepare($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'Prepare failed','error'=>$debug ? $conn->error : ''], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($types) { $stmt->bind_param($types, ...$params); }

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'Execute failed','error'=>$debug ? $stmt->error : ''], JSON_UNESCAPED_UNICODE);
  exit;
}

$res  = $stmt->get_result();
$data = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();

echo json_encode(['ok'=>true,'data'=>$data], JSON_UNESCAPED_UNICODE);
