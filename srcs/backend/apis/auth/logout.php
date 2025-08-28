<?php
// backend/apis/auth/logout.php
session_start();
header('Content-Type: application/json; charset=utf-8');

// (Nếu khác origin thì bật CORS)
// header('Access-Control-Allow-Origin: https://itdi.io.vn');
// header('Access-Control-Allow-Credentials: true');
// header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'message'=>'Method Not Allowed']); exit;
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
  $params = session_get_cookie_params();
  setcookie(session_name(), '', time()-42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
session_destroy();

echo json_encode(['ok'=>true,'message'=>'Đã đăng xuất']);
