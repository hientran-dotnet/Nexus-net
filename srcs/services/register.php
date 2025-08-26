<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");
require_once(__DIR__ . "config.php");

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$email    = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");
$key_code = trim($data["register_key"] ?? "");

if (!$username || !$email || !$password || !$key_code) {
    echo json_encode(["success" => false, "message" => "Thiếu thông tin bắt buộc"]);
    exit;
}

try {
    // 1. Kiểm tra mã xác thực
    $stmt = $pdo->prepare("SELECT * FROM verification_keys WHERE key_code = ? AND is_used = 0");
    $stmt->execute([$key_code]);
    $key = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$key) {
        echo json_encode(["success" => false, "message" => "Mã xác thực không hợp lệ hoặc đã được sử dụng"]);
        exit;
    }

    // 2. Hash mật khẩu
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // 3. Thêm user mới
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $password_hash, $key["role"]]);
    $user_id = $pdo->lastInsertId();

    // 4. Đánh dấu key đã sử dụng
    $stmt = $pdo->prepare("UPDATE verification_keys SET is_used = 1, used_by = ?, used_at = NOW() WHERE id = ?");
    $stmt->execute([$user_id, $key["id"]]);

    echo json_encode(["success" => true, "message" => "Đăng ký thành công"]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        // Duplicate entry
        echo json_encode(["success" => false, "message" => "Tên đăng nhập hoặc email đã tồn tại"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
    exit;
}
