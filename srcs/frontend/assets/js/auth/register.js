// assets/js/auth/register.js
(function () {
  const form = document.querySelector('form[name="sign-up-form"]');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    // Nếu form đã set action="backend/register.php" method="POST",
    // có thể bỏ preventDefault để submit truyền thống.
    // Ở đây mình dùng fetch để không tải lại trang:
    e.preventDefault();

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const password_confirm = form.querySelector('input[name="password_confirm"]').value;

    // Validate nhanh phía client
    if (!name || !email || !password || !password_confirm) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== password_confirm) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    const API_URL = new URL('/backend/apis/auth/register.php', location.origin).toString();

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, password_confirm })
      });


      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        alert(data?.message || 'Đăng ký thất bại.');
        return;
      }

      // Thành công: bạn có thể redirect sang trang chủ hoặc trang người dùng
      alert('Đăng ký thành công!');
      window.location.href = 'index.html';

    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    }
  });
})();
