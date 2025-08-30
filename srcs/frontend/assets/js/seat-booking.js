// Seat Booking Handler
(function() {
    // Constants
    const NORMAL_PRICE = 75000;
    const VIP_PRICE = 100000;
    const MAX_SEATS = 8;
    
    // State
    let selectedSeats = [];
    let seatData = {};
    
    // DOM Elements
    const seatGrid = document.getElementById('seat-grid');
    const selectedSeatsList = document.getElementById('selected-seats-list');
    const seatCount = document.getElementById('seat-count');
    const totalPrice = document.getElementById('total-price');
    const btnContinue = document.getElementById('btn-continue');
    const btnBack = document.getElementById('btn-back');
    const urlParams = new URLSearchParams(window.location.search);
    const showtimeId = urlParams.get('showtime_id')
    console.log(showtimeId);

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadBookingInfo();
        generateSeats();
        setupEventListeners();
    });
    
    function loadBookingInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieTitle = urlParams.get('movie') || 'Tên phim';
        const showDate = urlParams.get('date') || new Date().toISOString().split('T')[0];
        const showTime = urlParams.get('time') || '20:00';
        const cinemaName = 'CGV Vincom Đồng Khởi'; // Default cinema
        
        // Update UI
        document.getElementById('movie-title').textContent = movieTitle;
        document.getElementById('show-date').textContent = formatDate(showDate);
        document.getElementById('show-time').textContent = showTime;
        document.getElementById('cinema-name').textContent = cinemaName;
        
        // Update prices
        document.getElementById('normal-price').textContent = NORMAL_PRICE.toLocaleString('vi-VN') + 'đ';
        document.getElementById('vip-price').textContent = VIP_PRICE.toLocaleString('vi-VN') + 'đ';
    }
    
    function generateSeats() {
        const urlParams = new URLSearchParams(window.location.search);
        const showtimeId = urlParams.get('showtime_id');
        
        if (!showtimeId) {
            seatGrid.innerHTML = '<div class="error">Không tìm thấy thông tin suất chiếu</div>';
            return;
        }
        
        // Gọi API để lấy dữ liệu ghế thực tế
        loadSeatsFromAPI(showtimeId);
    }

    async function loadSeatsFromAPI(showtimeId) {
        try {
            seatGrid.innerHTML = '<div class="loading">Đang tải sơ đồ ghế...</div>';
            
            const response = await fetch(`https://itdi.io.vn/backend/apis/movies/getSeatAvailability.php?showtime_id=${showtimeId}`);
            const data = await response.json();
            
            console.log('Seat API Response:', data);
            
            if (data.ok && data.seats) {
                renderSeatsFromAPI(data);
            } else {
                console.error('API Error:', data);
                seatGrid.innerHTML = `
                    <div class="error">
                        <h4>Không thể tải sơ đồ ghế</h4>
                        <p>Lỗi: ${data.message || 'Unknown error'}</p>
                        ${data.debug ? `<pre>${JSON.stringify(data.debug, null, 2)}</pre>` : ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading seats:', error);
            seatGrid.innerHTML = `
                <div class="error">
                    <h4>Lỗi khi tải sơ đồ ghế</h4>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    function renderSeatsFromAPI(data) {
        const { auditorium, seats } = data;
        const totalRows = auditorium.total_rows;
        const totalCols = auditorium.total_cols;
        
        seatGrid.innerHTML = '';
        seatGrid.style.gridTemplateColumns = `30px repeat(${totalCols}, 1fr) 30px`;
        
        // Group seats by row
        const seatsByRow = {};
        seats.forEach(seat => {
            if (!seatsByRow[seat.row]) {
                seatsByRow[seat.row] = [];
            }
            seatsByRow[seat.row][seat.col_no - 1] = seat;
        });
        
        // Render seats row by row
        Object.keys(seatsByRow).sort().forEach(rowLetter => {
            // Left row label
            const leftLabel = document.createElement('div');
            leftLabel.className = 'row-label';
            leftLabel.textContent = rowLetter;
            seatGrid.appendChild(leftLabel);
            
            // Seats in this row
            for (let col = 1; col <= totalCols; col++) {
                const seat = seatsByRow[rowLetter][col - 1];
                
                if (seat) {
                    const seatElement = document.createElement('div');
                    seatElement.className = 'seat';
                    seatElement.dataset.seatId = seat.seat_id;
                    seatElement.dataset.dbId = seat.id;
                    seatElement.textContent = col;
                    
                    // Set seat status and type
                    if (seat.status === 'occupied') {
                        seatElement.classList.add('occupied');
                    } else {
                        seatElement.classList.add('available');
                        if (seat.type === 'vip') {
                            seatElement.classList.add('vip');
                        }
                    }
                    
                    // Store seat data
                    seatData[seat.seat_id] = {
                        id: seat.seat_id,
                        dbId: seat.id,
                        row: rowLetter,
                        number: col,
                        type: seat.type,
                        price: seat.price,
                        occupied: seat.status === 'occupied'
                    };
                    
                    seatGrid.appendChild(seatElement);
                } else {
                    // Empty space
                    const emptySeat = document.createElement('div');
                    emptySeat.className = 'seat-empty';
                    seatGrid.appendChild(emptySeat);
                }
            }
            
            // Right row label
            const rightLabel = document.createElement('div');
            rightLabel.className = 'row-label';
            rightLabel.textContent = rowLetter;
            seatGrid.appendChild(rightLabel);
        });
    }
    
    function setupEventListeners() {
        // Seat click handler
        seatGrid.addEventListener('click', function(e) {
            if (e.target.classList.contains('seat') && e.target.classList.contains('available')) {
                handleSeatClick(e.target);
            }
        });
        
        // Button handlers
        btnContinue.addEventListener('click', function() {
            if (selectedSeats.length > 0) {
                proceedToPayment();
            }
        });
        
        btnBack.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    function handleSeatClick(seatElement) {
        const seatId = seatElement.dataset.seatId;
        
        if (seatElement.classList.contains('selected')) {
            // Deselect seat
            seatElement.classList.remove('selected');
            selectedSeats = selectedSeats.filter(id => id !== seatId);
        } else {
            // Select seat (check limit)
            if (selectedSeats.length >= MAX_SEATS) {
                alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
                return;
            }

            seatElement.classList.add('selected');
            selectedSeats.push(seatId);
        }

        updateBookingSummary();
    }

    
    function updateBookingSummary() {
        // Update seat count
        seatCount.textContent = selectedSeats.length;
        
        // Update selected seats list
        if (selectedSeats.length === 0) {
            selectedSeatsList.innerHTML = '<p class="text-muted">Chưa chọn ghế nào</p>';
        } else {
            selectedSeatsList.innerHTML = selectedSeats.map(seatId => {
                const seat = seatData[seatId];
                return `
                    <div class="selected-seat-item">
                        <div class="seat-info">
                            <div class="seat-type-indicator ${seat.type}"></div>
                            <span>Ghế ${seat.id}</span>
                            <span class="badge badge-${seat.type === 'vip' ? 'warning' : 'secondary'}">${seat.type === 'vip' ? 'VIP' : 'Thường'}</span>
                        </div>
                        <span class="seat-price">${seat.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                `;
            }).join('');
        }
        
        // Calculate total price
        const total = selectedSeats.reduce((sum, seatId) => {
            return sum + seatData[seatId].price;
        }, 0);
        
        totalPrice.textContent = total.toLocaleString('vi-VN') + 'đ';
        
        // Enable/disable continue button
        btnContinue.disabled = selectedSeats.length === 0;
    }
    
    function proceedToPayment() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookingData = {
            movie: urlParams.get('movie'),
            date: urlParams.get('date'),
            time: urlParams.get('time'),
            showtime_id: urlParams.get('showtime_id'),
            seats: selectedSeats.map(seatId => seatData[seatId]),
            total: selectedSeats.reduce((sum, seatId) => sum + seatData[seatId].price, 0)
        };
        
        // Store booking data
        localStorage.setItem('bookingData', JSON.stringify(bookingData));
        
        // Redirect to payment page
        window.location.href = 'payment.html';
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const day = days[date.getDay()];
        const dateStr = date.toLocaleDateString('vi-VN');
        return `${day}, ${dateStr}`;
    }
})();