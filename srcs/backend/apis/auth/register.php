<?php
// backend/register.php
// API đăng ký tài khoản user (role mặc định = 'user')

session_start();
header('Content-Type: application/json; charset=utf-8');

// Cho phép gọi từ cùng domain; nếu gọi chéo domain, bật CORS tối thiểu:
// header('Access-Control-Allow-Origin: https://your-domain.com');
// header('Access-Control-Allow-Methods: POST, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'Method Not Allowed']);
  exit;
}

require_once __DIR__ . '/../../db/config.php';

// Hỗ trợ cả JSON và form-urlencoded
$raw = file_get_contents('php://input');
if ($raw && empty($_POST)) {
  $json = json_decode($raw, true);
  if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
    $_POST = $json; // gán để dùng chung
  }
}

// Helper lấy input
function post_str($k){ return isset($_POST[$k]) ? trim((string)$_POST[$k]) : ''; }

$name             = post_str('name');
$email            = post_str('email');
$password         = isset($_POST['password']) ? (string)$_POST['password'] : '';
$password_confirm = isset($_POST['password_confirm']) ? (string)$_POST['password_confirm'] : '';

$errors = [];
if ($name === '')                                   $errors[] = 'Vui lòng nhập tên đầy đủ.';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email không hợp lệ.';
if (mb_strlen($password) < 6)                       $errors[] = 'Mật khẩu phải từ 6 ký tự.';
if ($password !== $password_confirm)                $errors[] = 'Mật khẩu xác nhận không khớp.';

if ($errors) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>implode(' ', $errors)]);
  exit;
}

// Kiểm tra email đã tồn tại
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'DB prepare failed']); exit;
}
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
  $stmt->close();
  http_response_code(409);
  echo json_encode(['ok'=>false,'message'=>'Email đã được sử dụng.']); exit;
}
$stmt->close();

// Hash mật khẩu & tạo user
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'user', 'active')");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'DB prepare failed']); exit;
}
$stmt->bind_param("sss", $name, $email, $hash);
$ok = $stmt->execute();
if (!$ok) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'Không thể tạo tài khoản.']); 
  $stmt->close(); exit;
}

$user_id = $stmt->insert_id;
$stmt->close();

// Auto-login (session)
$_SESSION['user_id']    = $user_id;
$_SESSION['user_email'] = $email;
$_SESSION['user_name']  = $name;
$_SESSION['user_role']  = 'user';

// Trả JSON
echo json_encode([
  'ok' => true,
  'message' => 'Đăng ký thành công.',
  'data' => ['id'=>$user_id,'name'=>$name,'email'=>$email,'role'=>'user']
]);
