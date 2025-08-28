<?php
// backend/apis/auth/me.php
session_start();
header('Content-Type: application/json; charset=utf-8');

// (Nếu khác origin thì bật CORS)
// header('Access-Control-Allow-Origin: https://itdi.io.vn');
// header('Access-Control-Allow-Credentials: true');

$isAuth = isset($_SESSION['user_id']);

if (!$isAuth) {
  echo json_encode(['ok'=>true,'authenticated'=>false]);
  exit;
}

echo json_encode([
  'ok'=>true,
  'authenticated'=>true,
  'user'=>[
    'id'    => (int)$_SESSION['user_id'],
    'name'  => $_SESSION['user_name'] ?? '',
    'email' => $_SESSION['user_email'] ?? '',
    'role'  => $_SESSION['user_role'] ?? 'user'
  ]
]);
