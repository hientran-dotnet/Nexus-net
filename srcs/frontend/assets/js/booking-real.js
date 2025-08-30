// Real booking page JavaScript
let selectedSeats = [];
let movieData = {};
let showtimeData = {};

// Load data from URL parameters and fetch from API
function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Extract data from URL
    const showtimeId = urlParams.get('showtime_id');
    const movieTitle = decodeURIComponent(urlParams.get('movie') || 'Đang tải...');
    const showDate = urlParams.get('date');
    const showTime = decodeURIComponent(urlParams.get('time') || '');
    const basePrice = parseInt(urlParams.get('price')) || 85000;
    
    console.log('URL Parameters:', { showtimeId, movieTitle, showDate, showTime, basePrice });
    
    // Set default movie data
    movieData = {
        id: parseInt(showtimeId) || 1,
        title: movieTitle,
        poster_url: "assets/images/banner1.jpg", // Default poster
        duration: 120,
        genre: "Đang tải...",
        rating: "P13",
        basePrice: basePrice
    };
    
    // Set default showtime data
    showtimeData = {
        id: parseInt(showtimeId) || 1,
        date: showDate || "2025-08-30",
        time: showTime || "02:00 PM",
        cinema: "CGV Vincom Đồng Khởi",
        hall: "Đang tải...",
        format: "2D"
    };
    
    // Load real data from API if showtime_id exists
    if (showtimeId) {
        loadMovieDetailsFromAPI(showtimeId);
    } else {
        // Update page display with URL data
        updatePageInfo();
    }
}

// Load movie details from API
async function loadMovieDetailsFromAPI(showtimeId) {
    try {
        console.log('🎬 Loading movie details from API...');
        
        const response = await fetch(`backend/apis/movies/detail.php?showtime_id=${showtimeId}`);
        const result = await response.json();
        
        console.log('📡 API Response:', result);
        
        if (result.ok && result.data) {
            const movie = result.data;
            
            // Update movie data with real API data
            movieData = {
                ...movieData,
                title: movie.title,
                description: movie.description,
                duration: movie.duration_min,
                poster_url: movie.poster_url || movieData.poster_url,
                backdrop_url: movie.backdrop_url,
                genre: movie.genre,
                director: movie.director,
                cast: movie.cast,
                rating: movie.rating_avg,
                basePrice: movie.showtime ? movie.showtime.base_price : movieData.basePrice
            };
            
            // Update showtime data
            if (movie.showtime) {
                showtimeData = {
                    ...showtimeData,
                    id: movie.showtime.id,
                    starts_at: movie.showtime.starts_at,
                    ends_at: movie.showtime.ends_at,
                    hall: movie.showtime.auditorium_name
                };
            }
            
            console.log('✅ Updated movie data:', movieData);
            console.log('✅ Updated showtime data:', showtimeData);
        } else {
            console.warn('⚠️ API Error:', result.message);
        }
    } catch (error) {
        console.error('❌ Failed to load movie details:', error);
    } finally {
        // Always update UI (with real data or fallback)
        updatePageInfo();
    }
}

// Update page information display
function updatePageInfo() {
    console.log('🔄 Updating page info with:', { movieData, showtimeData });
    
    // Update movie title
    const movieTitleElement = document.getElementById('movie-title');
    if (movieTitleElement) {
        movieTitleElement.textContent = movieData.title;
    }
    
    // Update movie poster
    const posterElement = document.getElementById('movie-poster');
    if (posterElement && movieData.poster_url) {
        posterElement.src = movieData.poster_url;
        posterElement.alt = movieData.title;
    }
    
    // Update show date
    const dateElement = document.getElementById('show-date');
    if (dateElement) {
        if (showtimeData.starts_at) {
            const date = new Date(showtimeData.starts_at);
            dateElement.textContent = formatDateForDisplay(date.toISOString().split('T')[0]);
        } else if (showtimeData.date) {
            dateElement.textContent = formatDateForDisplay(showtimeData.date);
        }
    }
    
    // Update show time
    const timeElement = document.getElementById('show-time');
    if (timeElement) {
        if (showtimeData.starts_at) {
            const date = new Date(showtimeData.starts_at);
            timeElement.textContent = date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
        } else {
            timeElement.textContent = showtimeData.time;
        }
    }
    
    // Update cinema and auditorium
    const cinemaElement = document.getElementById('cinema-name');
    if (cinemaElement) {
        cinemaElement.textContent = `${showtimeData.cinema} - ${showtimeData.hall}`;
    }
    
    // Update pricing with real base price
    const normalPriceElement = document.getElementById('normal-price');
    const vipPriceElement = document.getElementById('vip-price');
    
    if (normalPriceElement) {
        normalPriceElement.textContent = formatCurrency(movieData.basePrice);
    }
    
    if (vipPriceElement) {
        const vipPrice = movieData.basePrice + 25000; // VIP surcharge
        vipPriceElement.textContent = formatCurrency(vipPrice);
    }
    
    console.log('✅ Page info updated successfully');
}

// Function được gọi khi user click "Tiếp tục thanh toán"
function proceedToPayment() {
    if (selectedSeats.length === 0) {
        alert('Vui lòng chọn ít nhất 1 ghế.');
        return;
    }
    
    // Ensure data is loaded from URL
    if (!movieData.id) {
        loadDataFromURL();
    }
    
    // Format date cho display
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Get base price from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const basePrice = parseInt(urlParams.get('price')) || 75000;
    
    // Prepare booking data đúng format
    const bookingData = {
        movieId: movieData.id,
        movieTitle: movieData.title,
        moviePoster: movieData.poster_url,
        showtimeId: showtimeData.id,
        showDate: formatDateForDisplay(showtimeData.date),
        showTime: showtimeData.time,
        cinemaName: showtimeData.cinema,
        hallName: showtimeData.hall,
        format: showtimeData.format,
        selectedSeats: selectedSeats,
        normalPrice: basePrice, // Use price from URL
        vipPrice: basePrice + 25000, // VIP thêm 25k
        totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
        timestamp: new Date().toISOString()
    };
    
    console.log('Storing booking data for payment:', bookingData);
    console.log('Selected seats:', selectedSeats);
    
    // Store booking data in localStorage
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Simulate seat selection (call this when user clicks on seats)
function selectSeat(seatId, row, number, type) {
    // Get base price from URL
    const urlParams = new URLSearchParams(window.location.search);
    const basePrice = parseInt(urlParams.get('price')) || 75000;
    
    const price = type === 'vip' ? basePrice + 25000 : basePrice; // VIP thêm 25k
    
    const seatIndex = selectedSeats.findIndex(seat => seat.id === seatId);
    
    if (seatIndex >= 0) {
        // Deselect seat
        selectedSeats.splice(seatIndex, 1);
        console.log('Deselected seat:', seatId);
    } else {
        // Select seat
        if (selectedSeats.length >= 8) {
            alert('Bạn chỉ có thể chọn tối đa 8 ghế.');
            return;
        }
        
        selectedSeats.push({
            id: seatId,
            row: row,
            number: number,
            type: type,
            price: price
        });
        console.log('Selected seat:', seatId, 'Price:', price);
    }
    
    updateBookingSummary();
}

// Update booking summary display
function updateBookingSummary() {
    // Get base price from URL
    const urlParams = new URLSearchParams(window.location.search);
    const basePrice = parseInt(urlParams.get('price')) || 75000;
    
    const normalSeats = selectedSeats.filter(seat => seat.type === 'normal');
    const vipSeats = selectedSeats.filter(seat => seat.type === 'vip');
    
    const normalTotal = normalSeats.length * basePrice;
    const vipTotal = vipSeats.length * (basePrice + 25000);
    const totalAmount = normalTotal + vipTotal;
    
    console.log('Booking summary:', {
        normalSeats: normalSeats.length,
        vipSeats: vipSeats.length,
        basePrice: basePrice,
        totalAmount: totalAmount,
        selectedSeats: selectedSeats
    });
    
    // Update UI elements
    updateBookingUI(basePrice, totalAmount);
}

// Update booking UI elements
function updateBookingUI(basePrice, totalAmount) {
    // Update selected seats list
    const seatsList = document.getElementById('selected-seats-list');
    if (seatsList) {
        if (selectedSeats.length === 0) {
            seatsList.innerHTML = '<p class="text-muted">Chưa chọn ghế nào</p>';
        } else {
            const seatsHtml = selectedSeats.map(seat => {
                const seatClass = seat.type === 'vip' ? 'seat-tag vip' : 'seat-tag normal';
                return `<span class="${seatClass}">${seat.id}</span>`;
            }).join('');
            seatsList.innerHTML = seatsHtml;
        }
    }
    
    // Update seat count
    const seatCount = document.getElementById('seat-count');
    if (seatCount) {
        seatCount.textContent = selectedSeats.length;
    }
    
    // Update prices
    const normalPriceElement = document.getElementById('normal-price');
    if (normalPriceElement) {
        normalPriceElement.textContent = formatCurrency(basePrice);
    }
    
    const vipPriceElement = document.getElementById('vip-price');
    if (vipPriceElement) {
        vipPriceElement.textContent = formatCurrency(basePrice + 25000);
    }
    
    // Update total
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = formatCurrency(totalAmount);
    }
    
    // Enable/disable continue button
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) {
        continueBtn.disabled = selectedSeats.length === 0;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize the seat map
function initializeSeatMap() {
    const seatGrid = document.getElementById('seat-grid');
    if (!seatGrid) {
        console.warn('Seat grid container not found');
        return;
    }
    
    console.log('=== SEAT MAP INITIALIZATION DEBUG ===');
    console.log('Original seat grid content length:', seatGrid.innerHTML.length);
    console.log('Original seat grid HTML:', seatGrid.innerHTML.substring(0, 1000));
    
    // Check if seat-booking.js already created seats
    const existingSeats = seatGrid.querySelectorAll('.seat');
    console.log('Existing seats found:', existingSeats.length);
    
    if (existingSeats.length > 0) {
        console.log('Found existing seats from seat-booking.js, updating them with proper attributes');
        console.log('Sample existing seat HTML:', existingSeats[0] ? existingSeats[0].outerHTML : 'None');
        updateExistingSeatsWithAttributes(existingSeats);
        addSeatEventListeners(seatGrid);
        console.log('=== USING EXISTING SEATS - NO NEW GENERATION ===');
        return;
    }
    
    // If no existing seats, generate new ones
    console.log('No existing seats found, generating new ones...');
    console.log('=== GENERATING NEW SEAT MAP ===');
    
    // Generate seat map HTML
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    const vipRows = ['F', 'G', 'H']; // VIP rows
    const occupiedSeats = ['A1', 'A2', 'B5', 'C7', 'F10', 'G3']; // Mock occupied seats
    
    // Get currently selected seats to preserve them
    const currentlySelected = selectedSeats.map(seat => seat.id);
    console.log('Preserving selected seats:', currentlySelected);
    
    let html = '<div class="cinema-screen"><div class="screen-text">MÀN HÌNH</div></div>';
    
    rows.forEach(row => {
        html += `<div class="seat-row">`;
        html += `<div class="row-label">${row}</div>`;
        
        // Left section (seats 1-6)
        html += `<div class="seat-section">`;
        for (let seatNum = 1; seatNum <= 6; seatNum++) {
            const seatId = `${row}${seatNum}`;
            const isVip = vipRows.includes(row);
            const isOccupied = occupiedSeats.includes(seatId);
            const isSelected = currentlySelected.includes(seatId);
            
            let seatClass = 'seat seat-available';
            if (isOccupied) {
                seatClass = 'seat seat-occupied';
            } else if (isSelected) {
                seatClass = 'seat seat-selected';
            } else if (isVip) {
                seatClass = 'seat seat-available seat-vip';
            }
            
            html += `<button class="${seatClass}" data-seat-id="${seatId}" data-row="${row}" data-number="${seatNum}" data-type="${isVip ? 'vip' : 'normal'}"${isOccupied ? ' disabled' : ''}>${seatNum}</button>`;
        }
        html += `</div>`;
        
        // Center aisle
        html += `<div class="center-aisle"></div>`;
        
        // Right section (seats 7-12)
        html += `<div class="seat-section">`;
        for (let seatNum = 7; seatNum <= seatsPerRow; seatNum++) {
            const seatId = `${row}${seatNum}`;
            const isVip = vipRows.includes(row);
            const isOccupied = occupiedSeats.includes(seatId);
            const isSelected = currentlySelected.includes(seatId);
            
            let seatClass = 'seat seat-available';
            if (isOccupied) {
                seatClass = 'seat seat-occupied';
            } else if (isSelected) {
                seatClass = 'seat seat-selected';
            } else if (isVip) {
                seatClass = 'seat seat-available seat-vip';
            }
            
            html += `<button class="${seatClass}" data-seat-id="${seatId}" data-row="${row}" data-number="${seatNum}" data-type="${isVip ? 'vip' : 'normal'}"${isOccupied ? ' disabled' : ''}>${seatNum}</button>`;
        }
        html += `</div>`;
        
        html += `<div class="row-label">${row}</div>`;
        html += `</div>`;
    });
    
    seatGrid.innerHTML = html;
    
    // Debug: Check created seats
    console.log('Simple seat grid created');
    const allSeats = seatGrid.querySelectorAll('.seat');
    console.log('Total seats created:', allSeats.length);
    
    // Check first few seats for debugging
    for (let i = 0; i < Math.min(5, allSeats.length); i++) {
        const seat = allSeats[i];
        console.log(`Seat ${i}:`, {
            outerHTML: seat.outerHTML,
            attributes: {
                'data-seat-id': seat.getAttribute('data-seat-id'),
                'data-row': seat.getAttribute('data-row'),
                'data-number': seat.getAttribute('data-number'),
                'data-type': seat.getAttribute('data-type')
            }
        });
    }
    
    // Add event delegation
    addSeatEventListeners(seatGrid);
}

// Update existing seats from seat-booking.js with proper attributes
function updateExistingSeatsWithAttributes(existingSeats) {
    console.log('=== UPDATING EXISTING SEATS DEBUG ===');
    console.log('Total seats to update:', existingSeats.length);
    
    existingSeats.forEach((seat, index) => {
        const seatId = seat.getAttribute('data-seat-id');
        console.log(`Seat ${index}:`, {
            element: seat,
            tagName: seat.tagName,
            className: seat.className,
            originalSeatId: seatId,
            outerHTML: seat.outerHTML
        });
        
        if (seatId) {
            // Extract row and number from seatId (e.g., "A1" -> row="A", number="1")
            const row = seatId.charAt(0);
            const number = seatId.substring(1);
            
            // Determine if it's VIP based on row
            const vipRows = ['F', 'G', 'H'];
            const isVip = vipRows.includes(row);
            
            // Add missing attributes
            seat.setAttribute('data-row', row);
            seat.setAttribute('data-number', number);
            seat.setAttribute('data-type', isVip ? 'vip' : 'normal');
            
            console.log(`✅ Updated seat ${seatId}:`, {
                'data-seat-id': seat.getAttribute('data-seat-id'),
                'data-row': seat.getAttribute('data-row'),
                'data-number': seat.getAttribute('data-number'),
                'data-type': seat.getAttribute('data-type'),
                'updated-outerHTML': seat.outerHTML
            });
        } else {
            console.warn(`❌ Seat ${index} missing data-seat-id:`, seat.outerHTML);
        }
    });
    
    console.log('=== ALL EXISTING SEATS UPDATED ===');
}

// Add event listeners for seat clicks
function addSeatEventListeners(seatGrid) {
    seatGrid.addEventListener('click', function(e) {
        console.log('=== SEAT CLICK DEBUG ===');
        console.log('Raw click event:', e);
        console.log('Target element:', e.target);
        console.log('Target outerHTML:', e.target.outerHTML);
        
        // Check if we need to look at parent element
        let targetElement = e.target;
        
        // If clicked on text inside button, get the button element
        if (e.target.tagName !== 'BUTTON' && e.target.parentElement && e.target.parentElement.classList.contains('seat')) {
            targetElement = e.target.parentElement;
            console.log('Using parent element instead:', targetElement.outerHTML);
        }
        
        console.log('Final target element:', {
            element: targetElement,
            tagName: targetElement.tagName,
            className: targetElement.className,
            classList: Array.from(targetElement.classList),
            disabled: targetElement.disabled,
            hasDataSeatId: targetElement.hasAttribute('data-seat-id'),
            attributes: targetElement.getAttributeNames().reduce((attrs, name) => {
                attrs[name] = targetElement.getAttribute(name);
                return attrs;
            }, {})
        });
        
        if (targetElement.classList.contains('seat') && !targetElement.disabled) {
            const seatId = targetElement.getAttribute('data-seat-id');
            const row = targetElement.getAttribute('data-row');
            const number = targetElement.getAttribute('data-number');
            const type = targetElement.getAttribute('data-type');
            
            console.log('Extracted seat data:', { seatId, row, number, type });
            
            if (seatId && row && number && type) {
                console.log('All data valid, calling handleSeatClick...');
                handleSeatClick(seatId, row, number, type);
            } else {
                console.error('Missing required seat attributes!', {
                    seatId: seatId || 'MISSING',
                    row: row || 'MISSING', 
                    number: number || 'MISSING',
                    type: type || 'MISSING',
                    elementHTML: targetElement.outerHTML
                });
            }
        } else {
            console.log('Click ignored - conditions not met:', {
                hasSeatClass: targetElement.classList.contains('seat'),
                isDisabled: targetElement.disabled,
                classList: Array.from(targetElement.classList)
            });
        }
        console.log('=== END SEAT CLICK DEBUG ===');
    });
    
    console.log('Seat map initialized with event delegation');
}

// Handle seat click from the actual seat map
function handleSeatClick(seatId, row, number, type) {
    console.log('Seat clicked:', { seatId, row, number, type });
    
    // Find the seat button
    const seatButton = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (!seatButton || seatButton.disabled) {
        console.warn('Seat button not found or disabled:', seatId);
        return;
    }
    
    // Toggle seat selection
    if (seatButton.classList.contains('seat-selected')) {
        // Deselect
        seatButton.classList.remove('seat-selected');
        seatButton.classList.add('seat-available');
        console.log('Deselected seat:', seatId);
    } else {
        // Select
        seatButton.classList.remove('seat-available');
        seatButton.classList.add('seat-selected');
        console.log('Selected seat:', seatId);
    }
    
    // Update booking logic
    selectSeat(seatId, row, number, type);
}

// Make function globally available
window.handleSeatClick = handleSeatClick;

// Setup event listeners for booking UI
function setupBookingEventListeners() {
    // Continue button
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) {
        continueBtn.addEventListener('click', proceedToPayment);
    }
    
    // Back button
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    console.log('Booking event listeners setup');
}

// Make functions available globally
window.proceedToPayment = proceedToPayment;
window.selectSeat = selectSeat;
window.handleSeatClick = handleSeatClick;
window.selectedSeats = selectedSeats;

// For testing purposes - add quick select buttons
document.addEventListener('DOMContentLoaded', function() {
    // Load data from URL parameters
    loadDataFromURL();
    
    // Initialize real seat map
    initializeSeatMap();
    
    // Setup event listeners for booking UI
    setupBookingEventListeners();
    
    // Add test buttons for development
    const testContainer = document.createElement('div');
    testContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px;';
    testContainer.innerHTML = `
        <button onclick="selectSeat('E1', 'E', '1', 'normal')" style="display: block; margin: 5px 0; padding: 5px; background: green; color: white; border: none; border-radius: 3px;">Test E1 (Thường)</button>
        <button onclick="selectSeat('F5', 'F', '5', 'vip')" style="display: block; margin: 5px 0; padding: 5px; background: gold; color: black; border: none; border-radius: 3px;">Test F5 (VIP)</button>
        <button onclick="handleSeatClick('A1', 'A', '1', 'normal')" style="display: block; margin: 5px 0; padding: 5px; background: blue; color: white; border: none; border-radius: 3px;">Test A1 (Handle)</button>
        <button onclick="proceedToPayment()" style="display: block; margin: 5px 0; padding: 8px; background: red; color: white; border: none; border-radius: 3px; font-weight: bold;">→ Thanh toán</button>
        <div style="color: white; font-size: 12px; margin-top: 10px;">
            Ghế đã chọn: <span id="selected-count">0</span><br>
            Giá: <span id="base-price">${new URLSearchParams(window.location.search).get('price') || '75000'}đ</span>
        </div>
    `;
    
    document.body.appendChild(testContainer);
    
    // Update selected count
    const updateCount = () => {
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = selectedSeats.length;
        }
    };
    
    // Override selectSeat to update count
    const originalSelectSeat = window.selectSeat;
    window.selectSeat = function(...args) {
        originalSelectSeat.apply(this, args);
        updateCount();
    };
});

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
