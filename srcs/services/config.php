<?php
// Set UTF-8 encoding từ đầu
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');

// Cấu hình database
$host     = "localhost";
$dbname   = "iovnwfbo_datvephim";
$username = "iovnwfbo_laptrinhmang"; 
$password = "z4Uw72s6uJFTSr4mguNk"; 

try {
    // Kết nối bằng PDO với charset UTF-8
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);

    // Thiết lập charset UTF-8 explicitly
    $conn->exec("SET NAMES utf8mb4");
    $conn->exec("SET CHARACTER SET utf8mb4");
    
    // Debug: Test connection
    error_log("Database connection successful");
    
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die("❌ Lỗi kết nối CSDL: " . $e->getMessage());
}
?>