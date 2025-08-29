<?php
// backend/apis/showtimes/available_dates.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../db/config.php';

$movie_id = isset($_GET['movie_id']) ? (int)$_GET['movie_id'] : 0;
$days     = isset($_GET['days']) ? (int)$_GET['days'] : 60;
if ($movie_id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'message'=>'movie_id required']); exit; }

$sql = "SELECT DATE(s.start_time) AS d
        FROM showtimes s
        WHERE s.movie_id = ? AND s.status = 'open' AND s.start_time >= CURDATE()
        GROUP BY DATE(s.start_time)
        ORDER BY d ASC
        LIMIT ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$movie_id, $days]);
$rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo json_encode(['ok'=>true,'data'=>$rows]);
