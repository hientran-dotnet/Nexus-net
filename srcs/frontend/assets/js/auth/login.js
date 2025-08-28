// assets/js/auth-login.js
(function () {
  const form = document.querySelector('form[name="sign-in-form"]');
  if (!form) return;

  const API_LOGIN = 'https://itdi.io.vn/backend/apis/auth/login.php';

  const $ = (sel) => form.querySelector(sel);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = $('input[name="sign-in-email"]')?.value.trim();
    const password = $('input[name="sign-in-passwd"]')?.value || '';

    if (!email || !password) {
      alert('Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      const resp = await fetch(API_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // cần để PHP gửi/nhận cookie session
        body: JSON.stringify({ email, password })
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data.ok) {
        alert(data?.message || 'Đăng nhập thất bại.');
        return;
      }

      // Thành công: điều hướng về trang chủ (hoặc dashboard)
      window.location.href = '/frontend/index.html';
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    }
  });
})();
