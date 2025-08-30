<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../db/config.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$order_id = isset($_POST['order_id']) ? (int)$_POST['order_id'] : 0;
if ($order_id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'message'=>'Thiếu order_id']); exit; }

try {
  $conn->begin_transaction();
  // Đổi Orders -> Paid
  $s = $conn->prepare("UPDATE orders SET status='Paid' WHERE id=?");
  $s->bind_param("i", $order_id);
  $s->execute(); $s->close();

  // Chuyển Reserved -> Sold cho tất cả ghế của order
  $u = $conn->prepare("
    UPDATE showtime_seat_locks 
    SET lock_status='Sold', expires_at=NULL 
    WHERE order_id=? AND lock_status='Reserved'
  ");
  $u->bind_param("i", $order_id);
  $u->execute(); $u->close();

  $conn->commit();
  echo json_encode(['ok'=>true], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  if ($conn && $conn->errno === 0) { $conn->rollback(); }
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
