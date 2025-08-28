(function(){
  const API_DETAIL   = '/backend/apis/movies/detail.php';
  const API_SHOWTIME = '/backend/apis/showtimes/by-movie.php';

  const qs = new URLSearchParams(location.search);
  const slug = qs.get('slug');
  const id   = qs.get('id');

  if (!slug && !id) {
    alert('Thiếu tham số phim'); location.href = '/frontend/movies.html'; return;
  }

  const el = {
    poster:  document.getElementById('mv-poster'),
    title:   document.getElementById('mv-title'),
    meta:    document.getElementById('mv-meta'),
    desc:    document.getElementById('mv-desc'),
    trailer: document.getElementById('mv-trailer'),
    tabs:    document.getElementById('date-tabs'),
    list:    document.getElementById('showtime-list')
  };

  const esc = s => (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ---- Load detail ----
  fetch(`${API_DETAIL}?${slug ? 'slug='+encodeURIComponent(slug) : 'id='+id}`)
    .then(r => r.json())
    .then(j => {
      if (!j.ok) throw new Error(j.message||'Movie not found');
      const m = j.data;
      document.title = m.title + ' – Chi tiết phim';
      el.poster.src  = (m.poster_url || m.backdrop_url || '/frontend/assets/images/placeholder-poster.jpg');
      el.poster.alt  = m.title;
      el.title.textContent = m.title;
      el.meta.textContent  = [
        m.original_title ? `Tên gốc: ${m.original_title}` : '',
        m.duration_min ? `${m.duration_min} phút` : '',
        m.age_rating ? `Phân loại: ${m.age_rating}` : ''
      ].filter(Boolean).join(' • ');
      el.desc.textContent = m.description || 'Đang cập nhật nội dung.';

      if (m.trailer_url) {
        el.trailer.innerHTML = `<a class="btn btn-primary" href="${esc(m.trailer_url)}" target="_blank" rel="noopener">Xem trailer</a>`;
      }

      // Build 7 tabs ngày
      buildDateTabs(m.id);
      loadShowtimes(m.id, formatDate(new Date())); // hôm nay
    })
    .catch(e => { console.warn(e); alert('Không tải được chi tiết phim.'); });

  function formatDate(d){ // YYYY-MM-DD
    const y = d.getFullYear(),
          m = String(d.getMonth()+1).padStart(2,'0'),
          day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function buildDateTabs(movieId){
    const now = new Date();
    el.tabs.innerHTML = '';
    for (let i=0;i<7;i++){
      const d = new Date(now); d.setDate(now.getDate()+i);
      const label = d.toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit' });
      const value = formatDate(d);
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline-light';
      btn.textContent = label;
      btn.dataset.date = value;
      if (i===0) btn.classList.add('active');
      btn.addEventListener('click', ()=>{
        [...el.tabs.querySelectorAll('button')].forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        loadShowtimes(movieId, value);
      });
      el.tabs.appendChild(btn);
    }
  }

  // ---- Load showtimes ----
  function loadShowtimes(movieId, dateStr){
    el.list.innerHTML = '<p>Đang tải suất chiếu…</p>';
    fetch(`${API_SHOWTIME}?movie_id=${movieId}&date=${dateStr}`)
      .then(r => r.json())
      .then(j => {
        if (!j.ok) throw new Error(j.message||'Error');

        if (!j.data.length){
          el.list.innerHTML = '<p>Chưa có suất chiếu trong ngày này.</p>';
          return;
        }

        // group theo rạp
        const byCinema = {};
        j.data.forEach(st=>{
          const k = st.cinema_name || `Rạp ${st.cinema_id}`;
          (byCinema[k] ||= []).push(st);
        });

        let html = '';
        Object.keys(byCinema).forEach(cinema=>{
          html += `<div class="mb-3">
            <h5 class="mb-2">${esc(cinema)}</h5>
            <div>`;
          byCinema[cinema].forEach(st=>{
            const t = new Date(st.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
            html += `<a class="showtime-chip" href="seat_selection.html?showtime_id=${st.id}" title="Phòng ${esc(st.room_name||'')}, ${t}">
              ${t} • ${Number(st.base_price).toLocaleString('vi-VN')}đ
            </a>`;
          });
          html += `</div></div>`;
        });
        el.list.innerHTML = html;
      })
      .catch(e => { console.warn(e); el.list.innerHTML = '<p>Lỗi tải suất chiếu.</p>'; });
  }
})();
