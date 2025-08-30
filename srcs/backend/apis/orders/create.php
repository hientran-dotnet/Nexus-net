<?php
// backend/apis/orders/create.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../db/config.php'; // $conn = new mysqli(...)

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!$input) { $input = $_POST; }

$showtime_id   = isset($input['showtime_id']) ? (int)$input['showtime_id'] : 0;
$payment_method= $input['payment_method'] ?? 'Test';
$user_id       = isset($input['user_id']) ? (int)$input['user_id'] : null;
$customer      = $input['customer'] ?? []; // name, email, phone (tùy bạn lưu đâu)
$seats         = $input['seats'] ?? [];    // [{code:"A5", type:"normal"|"vip", price: 85000}, ...]

if ($showtime_id <= 0 || !is_array($seats) || count($seats) === 0) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>'Thiếu showtime_id hoặc danh sách ghế']);
  exit;
}

try {
  $conn->begin_transaction();

  // 1) Kiểm tra suất chiếu & lấy auditorium + base_price
  $q = $conn->prepare("SELECT auditorium_id, base_price FROM showtimes WHERE id=? LIMIT 1");
  $q->bind_param("i", $showtime_id);
  $q->execute();
  $res = $q->get_result();
  if ($res->num_rows === 0) { throw new Exception("Suất chiếu không tồn tại"); }
  $row = $res->fetch_assoc();
  $auditorium_id = (int)$row['auditorium_id'];
  $base_price = (int)$row['base_price'];
  $q->close();

  // 2) Map code -> seat_id và kiểm tra khóa ghế
  $seat_map = []; // code => ['id'=>..., 'price'=>...]
  foreach ($seats as $s) {
    $code  = strtoupper(trim($s['code'] ?? ''));
    if ($code === '') { throw new Exception("Thiếu seat code"); }

    // tìm seat_id theo seat_code & auditorium_id
    $qs = $conn->prepare("SELECT id FROM seats WHERE auditorium_id=? AND seat_code=? LIMIT 1");
    $qs->bind_param("is", $auditorium_id, $code);
    $qs->execute();
    $rs = $qs->get_result();
    if ($rs->num_rows === 0) { throw new Exception("Ghế không hợp lệ: $code"); }
    $seat_id = (int)$rs->fetch_assoc()['id'];
    $qs->close();

    // kiểm tra đã bị giữ/bán?
    $ql = $conn->prepare("
      SELECT lock_status, expires_at 
      FROM showtime_seat_locks 
      WHERE showtime_id=? AND seat_id=? 
        AND (lock_status='Sold' OR (lock_status='Reserved' AND (expires_at IS NULL OR expires_at > NOW())))
      LIMIT 1
    ");
    $ql->bind_param("ii", $showtime_id, $seat_id);
    $ql->execute();
    $rl = $ql->get_result();
    if ($rl->num_rows > 0) {
      $info = $rl->fetch_assoc();
      throw new Exception("Ghế $code đã ".$info['lock_status']." (đang bận)");
    }
    $ql->close();

    // xác định giá (ưu tiên giá client gửi; nếu không có -> normal=base, vip=base+15000)
    $type = strtolower($s['type'] ?? 'normal');
    $price = isset($s['price']) ? (int)$s['price'] : ($type === 'vip' ? $base_price + 15000 : $base_price);

    $seat_map[$code] = ['id'=>$seat_id, 'price'=>$price];
  }

  // 3) Tạo order (Pending) + expires_at (giữ ghế 15 phút)
  $expires_minutes = 15;
  $q = $conn->prepare("
    INSERT INTO orders (user_id, showtime_id, status, total_amount, payment_method, created_at, expires_at)
    VALUES (?, ?, 'Pending', 0, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))
  ");
  // user_id có thể null -> dùng i hoặc s? Ta dùng "isii" kèm null bằng set_null
  // Đơn giản: ép null -> 0 (nếu bạn muốn cho phép null thì sửa schema hoặc dùng prepared khác)
  $uid = $user_id ?? 0;
  $q->bind_param("iisi", $uid, $showtime_id, $payment_method, $expires_minutes);
  $q->execute();
  $order_id = $conn->insert_id;
  $q->close();

  // 4) Thêm từng ghế vào order_items + khóa ghế Reserved
  $total = 0;
  foreach ($seat_map as $code => $info) {
    $seat_id = $info['id'];
    $price   = $info['price'];
    $total  += $price;

    $qi = $conn->prepare("INSERT INTO order_items (order_id, seat_id, price) VALUES (?,?,?)");
    $qi->bind_param("iii", $order_id, $seat_id, $price);
    $qi->execute();
    $qi->close();

    $ql = $conn->prepare("
      INSERT INTO showtime_seat_locks (showtime_id, seat_id, locked_by_user, lock_status, order_id, locked_at, expires_at)
      VALUES (?, ?, ?, 'Reserved', ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))
    ");
    $ql->bind_param("iiiii", $showtime_id, $seat_id, $uid, $order_id, $expires_minutes);
    $ql->execute();
    $ql->close();
  }

  // 5) Cập nhật tổng tiền
  $qu = $conn->prepare("UPDATE orders SET total_amount=? WHERE id=?");
  $qu->bind_param("ii", $total, $order_id);
  $qu->execute();
  $qu->close();

  $conn->commit();

  // Mã đơn tạm thời để hiển thị (giống logic front-end)
  $order_code = 'NX'.substr(time(), -6).strtoupper(substr(bin2hex(random_bytes(3)),0,6));

  echo json_encode([
    'ok' => true,
    'order_id' => $order_id,
    'order_code' => $order_code,
    'total' => $total,
    'expires_in_minutes' => $expires_minutes
  ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
  if ($conn && $conn->errno === 0) { $conn->rollback(); }
  http_response_code(400);
  echo json_encode(['ok'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
