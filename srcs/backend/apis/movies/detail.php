<?php
// backend/apis/movies/detail.php - Get movie details by ID

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit; 
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../db/config.php';

if (!isset($conn) || !($conn instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Database connection failed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn->set_charset('utf8mb4');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Get parameters
$movieId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$showtimeId = isset($_GET['showtime_id']) ? (int)$_GET['showtime_id'] : 0;

if ($movieId <= 0 && $showtimeId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Missing movie ID or showtime ID'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($showtimeId > 0) {
        // Get movie details via showtime ID
        $sql = "
            SELECT 
                m.id,
                m.title,
                m.description,
                m.duration_min,
                m.poster_url,
                m.backdrop_url,
                m.rating_avg,
                m.rating_count,
                m.release_date,
                m.genre,
                m.director,
                m.cast,
                st.id as showtime_id,
                st.starts_at,
                st.ends_at,
                st.base_price,
                a.name as auditorium_name
            FROM movies m
            JOIN showtimes st ON m.id = st.movie_id
            JOIN auditoriums a ON st.auditorium_id = a.id
            WHERE st.id = ?
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $showtimeId);
    } else {
        // Get movie details by movie ID
        $sql = "
            SELECT 
                id,
                title,
                description,
                duration_min,
                poster_url,
                backdrop_url,
                rating_avg,
                rating_count,
                release_date,
                genre,
                director,
                cast
            FROM movies 
            WHERE id = ?
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $movieId);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'message' => 'Movie not found'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $movie = $result->fetch_assoc();
    
    // Format data
    $response = [
        'ok' => true,
        'data' => [
            'id' => (int)$movie['id'],
            'title' => $movie['title'],
            'description' => $movie['description'],
            'duration_min' => (int)$movie['duration_min'],
            'poster_url' => $movie['poster_url'],
            'backdrop_url' => $movie['backdrop_url'],
            'rating_avg' => $movie['rating_avg'] ? (float)$movie['rating_avg'] : null,
            'rating_count' => $movie['rating_count'] ? (int)$movie['rating_count'] : 0,
            'release_date' => $movie['release_date'],
            'genre' => $movie['genre'],
            'director' => $movie['director'],
            'cast' => $movie['cast']
        ]
    ];
    
    // Add showtime info if available
    if (isset($movie['showtime_id'])) {
        $response['data']['showtime'] = [
            'id' => (int)$movie['showtime_id'],
            'starts_at' => $movie['starts_at'],
            'ends_at' => $movie['ends_at'],
            'base_price' => (int)$movie['base_price'],
            'auditorium_name' => $movie['auditorium_name']
        ];
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("Movie detail API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Internal server error'], JSON_UNESCAPED_UNICODE);
}
?>
