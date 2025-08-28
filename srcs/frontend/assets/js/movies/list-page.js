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
    if (!u) return '';
    if (u.startsWith('http') || u.startsWith('/')) return u;
    return '/frontend/' + u.replace(/^\/+/, '');
  };

  function card(movie) {
    const poster = resolveUrl(movie.poster_url || movie.backdrop_url || '');
    const title  = esc(movie.title || '');
    const mins   = movie.duration_min ? `${movie.duration_min} phút` : '—';

    return `
      <div class="item vhny-grid col-6 col-md-4 col-lg-3 mb-4">
        <div class="box16 mb-0 movie-card">
          <a href="movie-detail.html?slug=${encodeURIComponent(movie.slug || movie.id)}">
            <figure>
              <img class="img-fluid" loading="lazy" src="${poster}" alt="${title}">
            </figure>
            <div class="box-content">
              <h3 class="title" title="${title}">${title}</h3>
              <h4><span class="post"><span class="fa fa-clock-o"></span> ${mins}</span></h4>
            </div>
          </a>
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

function card(movie){
  const title  = esc(movie.title || '');
  const mins   = movie.duration_min ? `${movie.duration_min} phút` : '—';
  const slug   = encodeURIComponent(movie.slug || movie.id);
  const poster = resolveUrl(movie.poster_url || movie.backdrop_url || '/frontend/assets/images/placeholder-poster.jpg');
  const badge  = movie.status === 'now_showing'
    ? '<span class="badge badge-green">Đang chiếu</span>'
    : (movie.status === 'coming_soon' ? '<span class="badge">Sắp chiếu</span>' : '');

  return `
    <div class="col col-6 col-sm-4 col-md-3 col-lg-3 mb-4">
      <a class="movie-card" href="movie-detail.html?slug=${slug}">
        <div class="poster">
          ${badge}
          <img loading="lazy" src="${poster}" alt="${title}">
        </div>
        <div class="meta">
          <div class="title" title="${title}">${title}</div>
          <div class="duration"><span class="fa fa-clock-o"></span> ${mins}</div>
        </div>
      </a>
    </div>`;
}