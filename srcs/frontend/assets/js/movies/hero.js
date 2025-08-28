// /frontend/assets/js/movies/hero.js
window.USE_DYNAMIC_OWL_ONE = true;


(function () {
  // Đặt cờ để index.html KHÔNG tự init .owl-one lần nữa
  window.USE_DYNAMIC_OWL_ONE = true;

  // API: lấy phim đang chiếu, không ép phải có backdrop
  const API = '/backend/apis/movies/list.php?status=now_showing&with_backdrop=0&limit=8&order=release_desc';

  const $slider = $('.owl-one');
  if ($slider.length === 0) return;

  // Helper: chuẩn hoá URL ảnh (nếu bạn lưu đường dẫn tương đối trong DB)
  const resolveUrl = (u) => {
    if (!u) return '';
    if (u.startsWith('http') || u.startsWith('/')) return u;
    return '/frontend/' + u.replace(/^\/+/, '');
  };
  const esc = (s='') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  fetch(API, { credentials: 'include' })
    .then(r => r.json())
    .then(payload => {
      if (!payload?.ok) return;

      const items = payload.data || [];
      if (!items.length) return;

      // Nếu Owl đã được init trước đó -> destroy trước khi dựng mới
      if ($slider.hasClass('owl-loaded')) {
        $slider.trigger('destroy.owl.carousel');
        $slider.removeClass('owl-loaded');
        $slider.find('.owl-stage-outer').children().unwrap();
      }
      // Xoá nội dung tĩnh sẵn có
      $slider.empty();

      // Dựng slide đúng markup template
      const html = items.map(m => {
        const bg = resolveUrl(m.backdrop_url || m.poster_url || '');
        const title = esc(m.title || '');
        const desc = esc((m.description || '').slice(0, 200));

        // trailer_url: nếu có → mở popup iframe
        const trailer = m.trailer_url ? `
          <a href="${m.trailer_url}" class="trailer-link">
            <span class="video-play-icon"><span class="fa fa-play"></span></span>
            <h6>Watch Trailer</h6>
          </a>` : '';

        return `
        <div class="item">
          <li>
            <div class="slider-info banner-view bg bg2" style="background-image:url('${bg}');background-size:cover;background-position:center;">
              <div class="banner-info">
                <h3>${title}</h3>
                ${desc ? `<p>${desc}</p>` : ''}
                ${trailer}
              </div>
            </div>
          </li>
        </div>`;
      }).join('');

      $slider.html(html);

      // Khởi tạo Owl cho .owl-one – giữ đúng config template
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
      $('.trailer-link').magnificPopup({ type: 'iframe', preloader: false });
    })
    .catch(err => console.warn('movies-hero:', err));
})();
