<?php
header("Content-Type: application/json; charset=UTF-8");
require_once(__DIR__ . "config.php");

$data = json_decode(file_get_contents("php://input"), true);

$login_id = trim($data["username"] ?? ""); // có thể là username hoặc email
$password = trim($data["password"] ?? "");

if (!$login_id || !$password) {
    echo json_encode(["success" => false, "message" => "Thiếu thông tin đăng nhập"]);
    exit;
}

try {
    // 1. Lấy user theo username hoặc email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$login_id, $login_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Tài khoản không tồn tại"]);
        exit;
    }

    // 2. Kiểm tra mật khẩu
    if (!password_verify($password, $user["password_hash"])) {
        echo json_encode(["success" => false, "message" => "Sai mật khẩu"]);
        exit;
    }

    // 3. Nếu đúng → trả thông tin user
    echo json_encode([
        "success" => true,
        "message" => "Đăng nhập thành công",
        "user" => [
            "id"       => $user["id"],
            "username" => $user["username"],
            "email"    => $user["email"],
            "role"     => $user["role"]
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Lỗi: " . $e->getMessage()]);
}
