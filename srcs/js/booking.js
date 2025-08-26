// Booking system
let selectedSeats = [];
let currentMovie = null;

// Initialize booking page
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('seatMap')) return; // Only run on booking page
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        alert('Please login to book tickets!');
        window.location.href = 'login.html';
        return;
    }
    
    // Get movie from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'));
    
    if (movieId) {
        currentMovie = movies.find(m => m.id === movieId);
        if (currentMovie) {
            document.getElementById('bookingMovieTitle').textContent = currentMovie.title;
            document.getElementById('backToDetail').href = `movie-detail.html?id=${movieId}`;
        }
    }
    
    // Initialize seat map
    initSeatMap();
    updateBookingSummary();
    
    // Confirm booking button
    document.getElementById('confirmBookingBtn').addEventListener('click', function() {
        if (selectedSeats.length > 0) {
            alert(`Booking confirmed for ${selectedSeats.length} seats!\nTotal: ${(selectedSeats.length * 12).toFixed(2)}\nSeats: ${selectedSeats.join(', ')}`);
            window.location.href = '../index.html';
        }
    });
    
    // Update user interface
    updateUserInterface();
});

// Initialize Seat Map
function initSeatMap() {
    const seatMap = document.getElementById('seatMap');
    const rows = 10;
    const seatsPerRow = 12;
    let seatHTML = '';
    
    // Some seats are pre-booked for demo
    const bookedSeats = ['3-4', '3-5', '5-7', '5-8', '7-6', '8-3', '8-4', '8-5'];
    
    for (let row = 1; row <= rows; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
            const seatId = `${row}-${seat}`;
            const isBooked = bookedSeats.includes(seatId);
            const seatClass = isBooked ? 'seat booked' : 'seat available';
            
            seatHTML += `<div class="${seatClass}" data-seat="${seatId}" onclick="toggleSeat('${seatId}')"></div>`;
        }
    }
    
    seatMap.innerHTML = seatHTML;
}

// Toggle Seat Selection
function toggleSeat(seatId) {
    const seatElement = document.querySelector(`[data-seat="${seatId}"]`);
    
    if (seatElement.classList.contains('booked')) return;
    
    if (seatElement.classList.contains('selected')) {
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
        selectedSeats = selectedSeats.filter(s => s !== seatId);
    } else {
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
        selectedSeats.push(seatId);
    }
    
    updateBookingSummary();
}

// Update Booking Summary
function updateBookingSummary() {
    const seatsList = document.getElementById('selectedSeatsList');
    const totalPrice = document.getElementById('totalPrice');
    const confirmBtn = document.getElementById('confirmBookingBtn');
    
    if (selectedSeats.length === 0) {
        seatsList.textContent = 'None';
        totalPrice.textContent = '$0.00';
        confirmBtn.disabled = true;
    } else {
        seatsList.textContent = selectedSeats.join(', ');
        totalPrice.textContent = `${(selectedSeats.length * 12).toFixed(2)}`;
        confirmBtn.disabled = false;
    }
}