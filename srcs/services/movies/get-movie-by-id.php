<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . "/../config.php");

try {
    // Lấy ID phim từ query parameter hoặc POST data
    $movie_id = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $movie_id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $movie_id = isset($input['id']) ? (int)$input['id'] : null;
    }

    // Kiểm tra ID hợp lệ
    if (!$movie_id || $movie_id <= 0) {
        throw new Exception('ID phim không hợp lệ!');
    }

    // Truy vấn thông tin chi tiết phim (chỉ các trường có trong bảng)
    $sql = "SELECT 
                id,
                title,
                genre,
                duration,
                rating,
                release_date,
                poster_url,
                description
            FROM movies 
            WHERE id = :movie_id";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':movie_id', $movie_id, PDO::PARAM_INT);
    $stmt->execute();

    $movie = $stmt->fetch(PDO::FETCH_ASSOC);

    // Kiểm tra phim có tồn tại không
    if (!$movie) {
        throw new Exception('Không tìm thấy phim với ID này!');
    }

    // Format dữ liệu theo cấu trúc bảng thực tế
    $movie_detail = [
        'id' => (int)$movie['id'],
        'title' => $movie['title'],
        'genre' => $movie['genre'],
        'duration' => $movie['duration'],
        'rating' => $movie['rating'],
        'release_date' => $movie['release_date'],
        'poster_url' => $movie['poster_url'],
        'description' => $movie['description']
    ];

    // Trả về kết quả thành công
    echo json_encode([
        'success' => true,
        'message' => 'Lấy thông tin phim thành công!',
        'data' => $movie_detail
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    // Trả về lỗi
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'data' => null
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    // Lỗi database
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống database!',
        'error' => $e->getMessage(),
        'data' => null
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>