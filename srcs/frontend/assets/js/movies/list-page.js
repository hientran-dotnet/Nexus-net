// /frontend/assets/js/movies/list-page.js
(function () {
  // ĐỊNH NGHĨA API + LIMIT TRƯỚC
  const API   = '/backend/apis/movies/list.php';
  const LIMIT = 20;

  const grid   = document.getElementById('movie-grid');
  const btnMore = document.getElementById('btn-load-more');
  if (!grid || !btnMore) return;

  let offset = 0;
  let loading = false;
  let noMore  = false;

  const esc = (s='') =>
    s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const resolveUrl = (u) => {
    if (!u) return '/frontend/assets/images/placeholder-poster.jpg'; // THÊM DEFAULT
    if (u.startsWith('http') || u.startsWith('/')) return u; // THÊM RETURN
    return '/frontend/' + u.replace(/^\/+/, '');
  };

  function card(movie) {
    const poster = resolveUrl(movie.poster_url || movie.backdrop_url || '');
    const title  = esc(movie.title || '');
    const mins   = movie.duration_min ? `${movie.duration_min} phút` : '—';
    const slug   = encodeURIComponent(movie.slug || movie.id);
    const badge  = movie.status === 'now_showing'
      ? '<span class="badge badge-green">Đang chiếu</span>'
      : (movie.status === 'coming_soon' ? '<span class="badge">Sắp chiếu</span>' : '');

    // THÊM RETURN STATEMENT - ĐÂY LÀ NGUYÊN NHÂN CHÍNH
    return `
      <div class="col col-6 col-sm-4 col-md-3 col-lg-3 mb-4">
        <div class="movie-card">
          <a href="movie-detail.html?slug=${slug}">
            <div class="poster">
              ${badge}
              <img loading="lazy" src="${poster}" alt="${title}">
              <div class="play-overlay">
                <div class="play-btn">
                  <i class="fa fa-play"></i>
                </div>
              </div>
            </div>
          </a>
          <div class="movie-content">
            <h3 class="movie-title" title="${title}">${title}</h3>
            <div class="movie-meta">
              <div class="movie-duration">
                <i class="fa fa-clock-o"></i>
                <span>${mins}</span>
              </div>
            </div>
            <div class="movie-actions">
              <button class="btn-buy" onclick="openShowtimesPopup(${movie.id}, '${esc(title)}')">
                <i class="fa fa-ticket"></i> MUA VÉ
              </button>
            </div>
          </div>
        </div>
      </div>`;
}

  function setLoadingUI(on) {
    loading = on;
    btnMore.disabled = on || noMore;
    btnMore.innerHTML = on
      ? 'Đang tải…'
      : (noMore ? 'Hết phim' : 'Tải thêm <span class="fa fa-angle-double-right ml-2"></span>');
  }

  async function loadMore() {
    if (loading || noMore) return;
    setLoadingUI(true);

    try {
      const res = await fetch(`${API}?limit=${LIMIT}&offset=${offset}&order=release_desc&with_backdrop=0`,
                              { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const items = Array.isArray(json?.data) ? json.data : [];
      if (items.length === 0) { noMore = true; return; }

      grid.insertAdjacentHTML('beforeend', items.map(card).join(''));
      offset += items.length;
      if (items.length < LIMIT) noMore = true;
    } catch (e) {
      console.warn('load movies error', e);
      alert('Không tải được danh sách phim. Vui lòng thử lại.');
    } finally {
      setLoadingUI(false);
    }
  }

  // Khởi chạy
  loadMore();
  btnMore.addEventListener('click', loadMore);
})();