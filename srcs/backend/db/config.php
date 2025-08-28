<?php
// config.php
// Kết nối database MySQL bằng MySQLi (có thể đổi sang PDO nếu muốn)

// Thông tin kết nối
$db_host = "localhost"; 
$db_user = "iovnwfbo_thienle";
$db_pass = "tjDyDE7s67WAye8GAk8M";
$db_name = "iovnwfbo_datvephim";

// Tạo kết nối
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

// Thiết lập charset UTF-8 (quan trọng để tránh lỗi tiếng Việt)
$conn->set_charset("utf8mb4");

// Nếu bạn muốn test nhanh:
// echo "Kết nối thành công";
?>
