// frontend/assets/js/auth-state.js
(function () {
  const API_ME = '/backend/apis/auth/me.php';
  const API_LOGOUT = '/backend/apis/auth/logout.php';

  const container = document.querySelector('#login, #login_s');
  if (!container) return;

  const renderSignedOut = () => {
    container.innerHTML = `
      <a class="nav-link" href="/frontend/sign_in.html" title="Đăng nhập">
        <i class="fa fa-user-circle-o fa-lg"></i>
      </a>
    `;
  };

  const renderSignedIn = (user) => {
    container.innerHTML = `
      <div class="dropdown">
        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown"
           role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
           style="color: var(--theme-title); font-weight:600;">
          <i class="fa fa-user-circle-o mr-2"></i> ${user.name || user.email}
        </a>
        <div class="dropdown-menu dropdown-menu-right shadow" aria-labelledby="userDropdown">
          <span class="dropdown-item-text">
            Vai trò: <strong>${user.role || 'user'}</strong>
          </span>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" id="btn-logout">
            <i class="fa fa-sign-out mr-2"></i> Đăng xuất
          </a>
        </div>
      </div>
    `;

    container.querySelector('#btn-logout')?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch(API_LOGOUT, { method: 'POST', credentials: 'include' });
      } catch (e) {}
      location.href = '/frontend/index.html';
    });
  };

  fetch(API_ME, { credentials: 'include' })
    .then(r => r.json())
    .then(data => {
      if (data?.authenticated) renderSignedIn(data.user);
      else renderSignedOut();
    })
    .catch(() => renderSignedOut());
})();
