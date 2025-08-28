<?php
// backend/apis/auth/login.php
session_start();
header('Content-Type: application/json; charset=utf-8');

// (Nếu FE và BE khác origin thì bật CORS tối thiểu)
// header('Access-Control-Allow-Origin: https://itdi.io.vn');
// header('Access-Control-Allow-Credentials: true');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204); exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'message'=>'Method Not Allowed']); exit;
}

require_once __DIR__ . '/../../db/config.php';

// Cho phép cả JSON lẫn x-www-form-urlencoded
$raw = file_get_contents('php://input');
if ($raw && empty($_POST)) {
  $json = json_decode($raw, true);
  if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
    $_POST = $json;
  }
}

$email = isset($_POST['email']) ? trim((string)$_POST['email']) : '';
$password = isset($_POST['password']) ? (string)$_POST['password'] : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>'Email không hợp lệ.']); exit;
}
if ($password === '') {
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>'Vui lòng nhập mật khẩu.']); exit;
}

// Tìm user theo email
$stmt = $conn->prepare("SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'message'=>'DB prepare failed']); exit;
}
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

// Không tiết lộ là email hay mật khẩu sai (an toàn hơn)
if (!$user || !password_verify($password, $user['password_hash'])) {
  http_response_code(401);
  echo json_encode(['ok'=>false,'message'=>'Email hoặc mật khẩu không đúng.']); exit;
}
if ($user['status'] !== 'active') {
  http_response_code(403);
  echo json_encode(['ok'=>false,'message'=>'Tài khoản đã bị khoá.']); exit;
}

// Đăng nhập thành công → tạo session
$_SESSION['user_id']    = (int)$user['id'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_name']  = $user['name'];
$_SESSION['user_role']  = $user['role'];

echo json_encode([
  'ok'=>true,
  'message'=>'Đăng nhập thành công.',
  'data'=>[
    'id'=>(int)$user['id'],
    'name'=>$user['name'],
    'email'=>$user['email'],
    'role'=>$user['role']
  ]
]);
