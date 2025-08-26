<?php
// Cấu hình database
$host     = "localhost";
$dbname   = "iovnwfbo_datvephim";
$username = "iovnwfbo_laptrinhmang"; 
$password = "z4Uw72s6uJFTSr4mguNk"; 

try {
    // Kết nối bằng PDO (ổn định, bảo mật, hỗ trợ prepared statement)
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);

    // Thiết lập chế độ lỗi → ném exception nếu có lỗi
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Test kết nối (bạn có thể bỏ đi sau khi chắc chắn OK)
    // echo "✅ Kết nối CSDL thành công!";
} catch (PDOException $e) {
    die("❌ Lỗi kết nối CSDL: " . $e->getMessage());
}
?>
