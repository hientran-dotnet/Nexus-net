// Seat Booking JavaScript

let selectedSeats = [];
let movieData = {};
let showtimeData = {};
let seatPrices = {
    normal: 75000,
    vip: 100000
};

document.addEventListener('DOMContentLoaded', function() {
    // Load movie and showtime data from URL parameters
    loadMovieData();
    
    // Initialize seat map
    initializeSeatMap();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check authentication
    checkAuthStatus();
});

function loadMovieData() {
    // Get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    const showtimeId = urlParams.get('showtimeId');
    
    if (!movieId || !showtimeId) {
        alert('Thông tin không hợp lệ. Vui lòng chọn lại.');
        window.location.href = 'movies.html';
        return;
    }
    
    // Load movie data (simulate API call)
    fetchMovieData(movieId).then(movie => {
        if (movie) {
            movieData = movie;
            updateMovieInfo(movie);
        }
    });
    
    // Load showtime data (simulate API call)
    fetchShowtimeData(showtimeId).then(showtime => {
        if (showtime) {
            showtimeData = showtime;
            updateShowtimeInfo(showtime);
        }
    });
}

async function fetchMovieData(movieId) {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch(`/backend/apis/movies/details.php?id=${movieId}`);
        if (response.ok) {
            const data = await response.json();
            return data.movie;
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
    
    // Fallback mock data
    return {
        id: movieId,
        title: 'Tên phim mẫu',
        poster_url: 'assets/images/banner1.jpg',
        duration: 120,
        genre: 'Action',
        rating: 'P13'
    };
}

async function fetchShowtimeData(showtimeId) {
    try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch(`/backend/apis/movies/showtimes.php?id=${showtimeId}`);
        if (response.ok) {
            const data = await response.json();
            return data.showtime;
        }
    } catch (error) {
        console.error('Error fetching showtime data:', error);
    }
    
    // Fallback mock data
    return {
        id: showtimeId,
        date: '2025-08-30',
        time: '19:30',
        cinema: 'Nexus Cinema',
        hall: 'Phòng 1',
        format: '2D'
    };
}

function updateMovieInfo(movie) {
    document.getElementById('movie-title').textContent = movie.title;
    document.getElementById('movie-poster').src = movie.poster_url;
    
    // Update other movie details if elements exist
    const movieDetails = document.querySelector('.booking-details');
    if (movieDetails) {
        movieDetails.innerHTML = `
            <p><i class="fa fa-clock-o"></i> ${movie.duration} phút</p>
            <p><i class="fa fa-tag"></i> ${movie.genre}</p>
            <p><i class="fa fa-star"></i> ${movie.rating}</p>
        `;
    }
}

function updateShowtimeInfo(showtime) {
    const showtimeInfo = document.querySelector('.showtime-info');
    if (showtimeInfo) {
        showtimeInfo.innerHTML = `
            <p><i class="fa fa-calendar"></i> ${formatDate(showtime.date)}</p>
            <p><i class="fa fa-clock-o"></i> ${showtime.time}</p>
            <p><i class="fa fa-map-marker"></i> ${showtime.cinema} - ${showtime.hall}</p>
            <p><i class="fa fa-film"></i> ${showtime.format}</p>
        `;
    }
}

function initializeSeatMap() {
    const seatMapContainer = document.querySelector('.seat-map-container');
    if (!seatMapContainer) return;
    
    // Create seat map HTML
    const seatMapHTML = generateSeatMapHTML();
    seatMapContainer.innerHTML = seatMapHTML;
    
    // Add seat click handlers
    addSeatClickHandlers();
    
    // Load occupied seats from server
    loadOccupiedSeats();
}

function generateSeatMapHTML() {
    return `
        <div class="screen-indicator">
            <div class="screen">MÀN HÌNH</div>
        </div>
        
        <div class="seat-legend">
            <div class="legend-item">
                <span class="seat-icon available"></span>
                <span>Trống</span>
            </div>
            <div class="legend-item">
                <span class="seat-icon selected"></span>
                <span>Đã chọn</span>
            </div>
            <div class="legend-item">
                <span class="seat-icon occupied"></span>
                <span>Đã đặt</span>
            </div>
            <div class="legend-item">
                <span class="seat-icon vip"></span>
                <span>VIP</span>
            </div>
        </div>
        
        <div class="seat-map">
            ${generateSeatsHTML()}
        </div>
        
        <div class="seat-info">
            <div class="price-info">
                <p>Ghế thường: ${formatCurrency(seatPrices.normal)}</p>
                <p>Ghế VIP: ${formatCurrency(seatPrices.vip)}</p>
            </div>
        </div>
    `;
}

function generateSeatsHTML() {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    const vipRows = ['F', 'G', 'H']; // VIP rows
    
    let html = '';
    
    rows.forEach(row => {
        html += `<div class="seat-row">`;
        html += `<div class="row-label">${row}</div>`;
        
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const seatId = `${row}${seatNum}`;
            const isVip = vipRows.includes(row);
            const seatClass = `seat ${isVip ? 'vip' : 'normal'}`;
            
            html += `
                <button class="${seatClass}" 
                        data-seat-id="${seatId}" 
                        data-row="${row}" 
                        data-number="${seatNum}"
                        data-type="${isVip ? 'vip' : 'normal'}">
                    ${seatNum}
                </button>
            `;
        }
        
        html += `</div>`;
    });
    
    return html;
}

function addSeatClickHandlers() {
    const seats = document.querySelectorAll('.seat');
    
    seats.forEach(seat => {
        seat.addEventListener('click', function() {
            if (this.classList.contains('occupied')) {
                return; // Can't select occupied seats
            }
            
            const seatId = this.getAttribute('data-seat-id');
            const row = this.getAttribute('data-row');
            const number = this.getAttribute('data-number');
            const type = this.getAttribute('data-type');
            
            if (this.classList.contains('selected')) {
                // Deselect seat
                this.classList.remove('selected');
                selectedSeats = selectedSeats.filter(s => s.id !== seatId);
            } else {
                // Select seat (max 8 seats)
                if (selectedSeats.length >= 8) {
                    alert('Bạn chỉ có thể chọn tối đa 8 ghế.');
                    return;
                }
                
                this.classList.add('selected');
                selectedSeats.push({
                    id: seatId,
                    row: row,
                    number: number,
                    type: type,
                    price: seatPrices[type]
                });
            }
            
            updateBookingSummary();
        });
    });
}

function loadOccupiedSeats() {
    // Simulate API call to get occupied seats
    const showtimeId = new URLSearchParams(window.location.search).get('showtimeId');
    
    fetch(`/backend/apis/movies/getSeatAvailability.php?showtimeId=${showtimeId}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.occupiedSeats) {
                markOccupiedSeats(data.occupiedSeats);
            }
        })
        .catch(error => {
            console.error('Error loading seat availability:', error);
            // Mock occupied seats for demo
            markOccupiedSeats(['A1', 'A2', 'B5', 'C7', 'F10', 'G3']);
        });
}

function markOccupiedSeats(occupiedSeats) {
    occupiedSeats.forEach(seatId => {
        const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
        if (seatElement) {
            seatElement.classList.add('occupied');
            seatElement.disabled = true;
        }
    });
}

function updateBookingSummary() {
    const summaryContainer = document.querySelector('.booking-summary');
    if (!summaryContainer) return;
    
    if (selectedSeats.length === 0) {
        summaryContainer.innerHTML = `
            <h4>Tóm tắt đặt vé</h4>
            <p class="text-muted">Vui lòng chọn ghế</p>
        `;
        return;
    }
    
    const normalSeats = selectedSeats.filter(seat => seat.type === 'normal');
    const vipSeats = selectedSeats.filter(seat => seat.type === 'vip');
    
    const normalTotal = normalSeats.length * seatPrices.normal;
    const vipTotal = vipSeats.length * seatPrices.vip;
    const totalAmount = normalTotal + vipTotal;
    
    summaryContainer.innerHTML = `
        <h4>Tóm tắt đặt vé</h4>
        
        <div class="selected-seats">
            <h5>Ghế đã chọn</h5>
            <div class="seats-list">
                ${selectedSeats.map(seat => 
                    `<span class="seat-tag ${seat.type}">${seat.row}${seat.number}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="price-breakdown">
            ${normalSeats.length > 0 ? `
                <div class="price-item">
                    <span>Ghế thường (${normalSeats.length}):</span>
                    <span>${formatCurrency(normalTotal)}</span>
                </div>
            ` : ''}
            
            ${vipSeats.length > 0 ? `
                <div class="price-item">
                    <span>Ghế VIP (${vipSeats.length}):</span>
                    <span>${formatCurrency(vipTotal)}</span>
                </div>
            ` : ''}
            
            <div class="price-item total">
                <span>Tổng cộng:</span>
                <span>${formatCurrency(totalAmount)}</span>
            </div>
        </div>
        
        <button id="btn-continue-payment" class="btn btn-primary btn-block mt-3">
            Tiếp tục thanh toán
            <i class="fa fa-arrow-right ml-2"></i>
        </button>
    `;
    
    // Add continue button handler
    document.getElementById('btn-continue-payment').addEventListener('click', proceedToPayment);
}

function proceedToPayment() {
    if (selectedSeats.length === 0) {
        alert('Vui lòng chọn ít nhất 1 ghế.');
        return;
    }
    
    // Prepare booking data
    const bookingData = {
        movieId: movieData.id,
        movieTitle: movieData.title,
        moviePoster: movieData.poster_url,
        showtimeId: showtimeData.id,
        showDate: formatDate(showtimeData.date),
        showTime: showtimeData.time,
        cinemaName: showtimeData.cinema,
        hallName: showtimeData.hall,
        format: showtimeData.format,
        selectedSeats: selectedSeats,
        normalPrice: seatPrices.normal,
        vipPrice: seatPrices.vip,
        totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
        timestamp: new Date().toISOString()
    };
    
    // Store booking data in localStorage for payment page
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Store seat reservations temporarily (15 minutes)
    storeTemporarySeatReservation(bookingData);
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

function storeTemporarySeatReservation(bookingData) {
    const reservationData = {
        showtimeId: bookingData.showtimeId,
        seatIds: bookingData.selectedSeats.map(seat => seat.id),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        timestamp: new Date().toISOString()
    };
    
    // Store in localStorage (in real app, send to server)
    localStorage.setItem('seatReservation', JSON.stringify(reservationData));
    
    // Optional: Send to server for real-time seat locking
    fetch('/backend/apis/bookings/reserve-seats.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
    }).catch(error => {
        console.warn('Could not reserve seats on server:', error);
    });
}

function setupEventListeners() {
    // Back button
    const backButton = document.getElementById('btn-back-movies');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'movies.html';
        });
    }
    
    // Clear selection button
    const clearButton = document.getElementById('btn-clear-selection');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            clearSeatSelection();
        });
    }
}

function clearSeatSelection() {
    // Remove selected class from all seats
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    
    // Clear selected seats array
    selectedSeats = [];
    
    // Update summary
    updateBookingSummary();
}

function checkAuthStatus() {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        // Show login prompt
        const shouldLogin = confirm('Bạn cần đăng nhập để đặt vé. Chuyển đến trang đăng nhập?');
        if (shouldLogin) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `sign_in.html?redirect=${currentUrl}`;
        } else {
            window.location.href = 'movies.html';
        }
        return false;
    }
    return true;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Export functions for use in other scripts
window.bookingFunctions = {
    getSelectedSeats: () => selectedSeats,
    getMovieData: () => movieData,
    getShowtimeData: () => showtimeData,
    clearSeatSelection: clearSeatSelection
};