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
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = 16;
        const vipRows = ['G', 'H', 'I', 'J']; // 4 hàng cuối là VIP
        
        seatGrid.innerHTML = '';
        
        rows.forEach(row => {
            // Row label (left)
            const leftLabel = document.createElement('div');
            leftLabel.className = 'row-label';
            leftLabel.textContent = row;
            seatGrid.appendChild(leftLabel);
            
            // Seats
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatId = `${row}${i}`;
                const seat = document.createElement('div');
                seat.className = 'seat';
                seat.dataset.seatId = seatId;
                seat.dataset.row = row;
                seat.dataset.number = i;
                seat.textContent = i;
                
                // Determine seat type and availability
                const isVip = vipRows.includes(row);
                const isOccupied = Math.random() < 0.15; // 15% chance occupied
                
                if (isOccupied) {
                    seat.classList.add('occupied');
                } else if (isVip) {
                    seat.classList.add('vip', 'available');
                } else {
                    seat.classList.add('available');
                }
                
                // Store seat data
                seatData[seatId] = {
                    id: seatId,
                    row: row,
                    number: i,
                    type: isVip ? 'vip' : 'normal',
                    price: isVip ? VIP_PRICE : NORMAL_PRICE,
                    occupied: isOccupied
                };
                
                seatGrid.appendChild(seat);
            }
            
            // Row label (right)
            const rightLabel = document.createElement('div');
            rightLabel.className = 'row-label';
            rightLabel.textContent = row;
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