// Showtimes Popup Handler
let showtimesPopup = null;

function openShowtimesPopup(movieId, movieTitle) {
  createShowtimesPopup(movieId, movieTitle);
  document.body.appendChild(showtimesPopup);
  setTimeout(() => showtimesPopup.classList.add('active'), 10);
  loadShowtimes(movieId);
}

function closeShowtimesPopup() {
  if (showtimesPopup) {
    showtimesPopup.classList.remove('active');
    setTimeout(() => {
      if (showtimesPopup && showtimesPopup.parentNode) {
        showtimesPopup.parentNode.removeChild(showtimesPopup);
      }
      showtimesPopup = null;
    }, 300);
  }
}

function createShowtimesPopup(movieId, movieTitle) {
  const dates = generateDates();
  
  showtimesPopup = document.createElement('div');
  showtimesPopup.className = 'showtimes-overlay';
  showtimesPopup.innerHTML = `
    <div class="showtimes-popup">
      <div class="popup-header">
        <h3 class="popup-title">${movieTitle}</h3>
        <button class="close-btn" onclick="closeShowtimesPopup()">&times;</button>
      </div>
      <div class="popup-content">
        <div class="date-selector">
          ${dates.map((date, index) => `
            <div class="date-item ${index === 0 ? 'active' : ''}" 
                 data-date="${date.value}" 
                 onclick="selectDate('${date.value}', ${movieId})">
              <div class="date-day">${date.day}</div>
              <div class="date-number">${date.number}</div>
            </div>
          `).join('')}
        </div>
        <div id="cinema-content" class="cinema-list">
          <div class="loading-spinner">
            <i class="fa fa-spinner fa-spin"></i> Đang tải lịch chiếu...
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Close on overlay click
  showtimesPopup.addEventListener('click', (e) => {
    if (e.target === showtimesPopup) {
      closeShowtimesPopup();
    }
  });
}

function generateDates() {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const day = dayNames[date.getDay()];
    const number = date.getDate();
    const value = date.toISOString().split('T')[0];
    
    dates.push({ day, number, value });
  }
  
  return dates;
}

function selectDate(dateValue, movieId) {
  // Update active date
  document.querySelectorAll('.date-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-date="${dateValue}"]`).classList.add('active');
  
  // Load showtimes for selected date
  loadShowtimes(movieId, dateValue);
}

// async function loadShowtimes(movieId, date = null) {
//   const content = document.getElementById('cinema-content');
//   content.innerHTML = '<div class="loading-spinner"><i class="fa fa-spinner fa-spin"></i> Đang tải lịch chiếu...</div>';
  
//   try {
//     const dateParam = date || new Date().toISOString().split('T')[0];
//     const response = await fetch(`https://itdi.io.vn/backend/apis/movies/showtimes.php?movie_id=${movieId}&date=${dateParam}`);
//     const data = await response.json();
    
//     console.log('API Response:', data);
    
//     if (data.ok && data.data && data.data.length > 0) {
//       // Xử lý dữ liệu thực từ API
//       const movieData = data.data[0]; // Lấy movie đầu tiên
      
//       // Tạo cinema data từ response
//       const cinemaData = generateCinemaFromMovie(movieData, dateParam);
//       renderCinemas(cinemaData);
//     } else {
//       content.innerHTML = '<div class="loading-spinner">Không có lịch chiếu cho ngày này</div>';
//     }
//   } catch (error) {
//     console.error('Error loading showtimes:', error);
//     content.innerHTML = '<div class="loading-spinner">Lỗi khi tải lịch chiếu</div>';
//   }
// }

async function loadShowtimes(movieId, date = null) {
  const content = document.getElementById('cinema-content');
  content.innerHTML = '<div class="loading-spinner"><i class="fa fa-spinner fa-spin"></i> Đang tải lịch chiếu...</div>';

  try {
    const dateParam = (date || new Date().toISOString().split('T')[0]);
    const url = `https://itdi.io.vn/backend/apis/movies/showtimes.php?movie_id=${encodeURIComponent(movieId)}&date=${encodeURIComponent(dateParam)}`;
    const res = await fetch(url, { headers: { 'Accept':'application/json' }});
    const text = await res.text();

    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error('Response is not valid JSON: ' + text.slice(0,120)); }

    if (data.ok && Array.isArray(data.showtimes) && data.showtimes.length > 0) {
      // Group theo rạp từ dữ liệu thật
      const groups = {};
      for (const st of data.showtimes) {
        const k = st.auditorium_name || 'Rạp';
        (groups[k] ||= []).push(st);
      }

      // Convert sang cấu trúc cinema dùng chung với renderCinemas()
      const cinemas = Object.entries(groups).map(([name, arr]) => ({
        id: name, name, address: '',
        showtimes: arr
          .sort((a,b) => new Date(a.starts_at) - new Date(b.starts_at))
          .map((st, idx) => ({
            id: st.id,
            time: new Date(st.starts_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
            available: true,
            price: Number(st.base_price) || undefined
          }))
      }));

      renderCinemas(cinemas);
    } else {
      content.innerHTML = '<div class="loading-spinner">Không có lịch chiếu cho ngày này</div>';
    }
  } catch (err) {
    console.error('Error loading showtimes:', err);
    content.innerHTML = '<div class="loading-spinner">Lỗi khi tải lịch chiếu</div>';
  }
}


function generateCinemaFromMovie(movie, date) {
  // Tạo các khung giờ chiếu dựa trên thời lượng phim
  const duration = movie.duration_min || 120;
  const showtimes = generateShowtimes(duration);
  
  // Tạo danh sách rạp với các suất chiếu
  const cinemas = [
    {
      id: 1,
      name: "CGV Vincom Đồng Khởi",
      address: "Tầng 3, Vincom Center, 72 Lê Thánh Tôn, Q.1, TP.HCM",
      showtimes: showtimes.slice(0, 5) // 5 suất đầu
    },
    {
      id: 2,
      name: "CGV Landmark 81",
      address: "Tầng B1, Landmark 81, Vinhomes Central Park, Bình Thạnh",
      showtimes: showtimes.slice(2, 6) // 4 suất khác
    },
    {
      id: 3,
      name: "CGV Crescent Mall",
      address: "Tầng 5, Crescent Mall, 101 Tôn Dật Tiên, Q.7, TP.HCM",
      showtimes: showtimes.slice(1, 5) // 4 suất khác
    },
    {
      id: 4,
      name: "CGV Aeon Tân Phú",
      address: "Tầng 3, Aeon Mall Tân Phú, 30 Bờ Bao Tân Thắng, Tân Phú",
      showtimes: showtimes.slice(0, 4) // 4 suất đầu
    }
  ];

  return cinemas;
}

function generateShowtimes(duration) {
  const times = ["09:00", "10:30", "12:15", "14:45", "16:30", "18:15", "20:00", "21:45"];
  const currentHour = new Date().getHours();
  const currentDate = new Date().toISOString().split('T')[0];
  const selectedDate = document.querySelector('.date-item.active')?.dataset.date || currentDate;
  
  return times.map((time, index) => {
    const [hour] = time.split(':').map(Number);
    const isToday = selectedDate === currentDate;
    const isPast = isToday && hour <= currentHour;
    const isSoldOut = Math.random() > 0.8; // 20% chance sold out
    
    return {
      id: `showtime_${Date.now()}_${index}`,
      time: time,
      available: !isPast && !isSoldOut,
      movie_id: parseInt(document.querySelector('.date-item.active')?.onclick?.toString().match(/\d+/)?.[0] || 1),
      cinema_id: Math.floor(index / 2) + 1,
      date: selectedDate,
      price: 75000 + (hour >= 18 ? 15000 : 0) // Giá vé tối đắt hơn
    };
  });
}

function renderCinemas(cinemas) {
  const content = document.getElementById('cinema-content');
  content.innerHTML = cinemas.map(cinema => `
    <div class="cinema-item">
      <div class="cinema-header">
        <h4 class="cinema-name">${cinema.name}</h4>
        <p class="cinema-address">${cinema.address}</p>
      </div>
      <div class="showtime-grid">
        ${cinema.showtimes.map(showtime => {
          const priceText = showtime.price ? ` - ${showtime.price.toLocaleString('vi-VN')}đ` : '';
          return `
            <button class="showtime-btn ${showtime.available ? '' : 'sold-out'}" 
                    ${showtime.available ? `onclick="bookTicket('${showtime.id}', '${showtime.time}', ${showtime.price || 75000})"` : 'disabled'}
                    title="${showtime.available ? `Đặt vé suất ${showtime.time}${priceText}` : 'Hết vé'}">
              <div class="showtime-time">${showtime.time}</div>
              ${showtime.available && showtime.price ? `<div class="showtime-price">${showtime.price.toLocaleString('vi-VN')}đ</div>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function bookTicket(showtimeId, time, price) {
  const movieTitle = document.querySelector('.popup-title').textContent;
  const selectedDate = document.querySelector('.date-item.active').dataset.date;
  
  // Chuyển đến trang booking với thông tin chi tiết
  const params = new URLSearchParams({
    showtime_id: showtimeId,
    movie: movieTitle,
    date: selectedDate,
    time: time,
    price: price
  });
  
  window.location.href = `booking.html?${params.toString()}`;
}