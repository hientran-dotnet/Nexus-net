window.USE_DYNAMIC_OWL_ONE = true;

// frontend/assets/js/movies-slider.js
(function () {
  const API = '/backend/apis/movies/list.php?status=now_showing&with_backdrop=0&limit=8&order=release_desc';

  // Helpers
  const resolveUrl = (u) => {
    if (!u) return '';
    if (u.startsWith('http') || u.startsWith('/')) return u;
    // nếu bạn lưu đường dẫn tương đối kiểu assets/images/..., thêm tiền tố /frontend/
    return '/frontend/' + u.replace(/^\/+/, '');
  };
  const escapeHtml = (s='') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const $slider = $('.owl-one'); // slider hero
  if ($slider.length === 0) return;

  fetch(API, { credentials: 'include' })
    .then(r => r.json())
    .then(payload => {
      if (!payload?.ok) throw new Error('API fail');
      const items = payload.data || [];
      if (!items.length) return;

      // Nếu Owl đã init trước đó, destroy để build lại
      if ($slider.hasClass('owl-loaded')) {
        $slider.trigger('destroy.owl.carousel');
        $slider.removeClass('owl-loaded');
        $slider.find('.owl-stage-outer').children().unwrap();
      }
      $slider.empty();

      // Tạo slides theo markup template
      // (Xem index.html phần ".owl-one owl-carousel owl-theme") :contentReference[oaicite:1]{index=1}
      const html = items.map((m, idx) => {
        const backdrop = resolveUrl(m.backdrop_url || m.poster_url || '');
        const title = escapeHtml(m.title || '');
        const desc  = escapeHtml((m.description || '').slice(0, 160));
        const trailer = m.trailer_url ? m.trailer_url : '#';

        return `
        <div class="item">
          <li>
            <div class="slider-info banner-view bg bg2" style="background-image:url('${backdrop}'); background-size:cover; background-position:center;">
              <div class="banner-info">
                <h3>${title}</h3>
                ${desc ? `<p>${desc}</p>` : ''}
                ${m.trailer_url ? `
                  <a href="${trailer}" class="trailer-link">
                    <span class="video-play-icon"><span class="fa fa-play"></span></span>
                    <h6>Watch Trailer</h6>
                  </a>` : ``}
              </div>
            </div>
          </li>
        </div>`;
      }).join('');

      $slider.html(html);

      // Khởi tạo Owl (giữ đúng cấu hình cũ)
      $slider.owlCarousel({
        stagePadding: 280,
        loop: true,
        margin: 20,
        nav: true,
        responsiveClass: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplaySpeed: 1000,
        autoplayHoverPause: false,
        responsive: {
          0:    { items: 1, stagePadding: 40,  nav: false },
          480:  { items: 1, stagePadding: 60,  nav: true  },
          667:  { items: 1, stagePadding: 80,  nav: true  },
          1000: { items: 1,                  nav: true  }
        }
      });

      // Bật Magnific Popup dạng IFRAME cho trailer
      $('.trailer-link').magnificPopup({
        type: 'iframe',
        preloader: false
      });
    })
    .catch(err => {
      console.warn('movies-slider:', err);
    });
})();
