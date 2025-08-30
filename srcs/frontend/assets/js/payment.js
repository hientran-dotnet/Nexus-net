// Payment Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PAYMENT PAGE LOADED ===');
    
    // Initialize payment page
    initializePaymentPage();
    
    // Event listeners
    setupEventListeners();
    
    // Load booking data from previous page
    loadBookingData();
    
    // Setup payment method switching
    setupPaymentMethods();
    
    // Format card inputs
    setupCardFormatting();
    
    // Add test button for debugging
    const testButton = document.createElement('button');
    testButton.textContent = '🧪 Test với dữ liệu ghế';
    testButton.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 9999; background: #e91e63; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;';
    testButton.onclick = testWithSampleData;
    document.body.appendChild(testButton);
});

function initializePaymentPage() {
    // Check if user has booking data
    const bookingData = getBookingData();
    if (!bookingData) {
        alert('Không tìm thấy thông tin đặt vé. Vui lòng thử lại.');
        window.location.href = 'movies.html';
        return;
    }
    
    // Generate order ID
    const orderId = generateOrderId();
    localStorage.setItem('currentOrderId', orderId);
    
    // Update transfer content with order ID
    document.getElementById('transfer-content').textContent = `THANHTOAN ${orderId}`;
}

function setupEventListeners() {
    // Payment button
    document.getElementById('btn-payment').addEventListener('click', processPayment);
    
    // Back button
    document.getElementById('btn-back-booking').addEventListener('click', function() {
        window.location.href = 'booking.html' + window.location.search;
    });
    
    // Form validation
    const form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment();
        });
    }
}

function loadBookingData() {
    console.log('=== LOADING BOOKING DATA ===');
    
    // Check localStorage directly
    const rawData = localStorage.getItem('bookingData');
    console.log('Raw localStorage data:', rawData);
    
    const bookingData = getBookingData();
    console.log('Parsed booking data:', bookingData);
    
    if (!bookingData) {
        console.error('No booking data found in localStorage');
        // Don't redirect immediately - let's try to get data from URL
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL params:', urlParams.toString());
        
        if (!urlParams.get('movieId') && !urlParams.get('showtimeId')) {
            alert('Không tìm thấy thông tin đặt vé. Vui lòng thử lại.');
            window.location.href = 'movies.html';
            return;
        }
    }
    
    // Debug selected seats specifically
    console.log('Selected seats from booking data:', bookingData.selectedSeats);
    console.log('Selected seats type:', typeof bookingData.selectedSeats);
    console.log('Selected seats length:', bookingData.selectedSeats ? bookingData.selectedSeats.length : 'undefined');
    
    // Update movie information với error checking
    const movieElements = {
        'summary-title': bookingData.movieTitle || 'Tên phim',
        'summary-date': bookingData.showDate || 'Ngày chiếu',
        'summary-time': bookingData.showTime || 'Giờ chiếu',
        'summary-cinema': `${bookingData.cinemaName || 'Rạp chiếu'} - ${bookingData.hallName || 'Phòng'}`
    };
    
    Object.keys(movieElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = movieElements[id];
            console.log(`Updated ${id}:`, movieElements[id]); // Debug
        } else {
            console.warn(`Element with ID '${id}' not found!`);
        }
    });
    
    // Update poster if available
    const posterElement = document.getElementById('summary-poster');
    if (posterElement && bookingData.moviePoster) {
        posterElement.src = bookingData.moviePoster;
        posterElement.alt = bookingData.movieTitle;
        console.log('Updated poster:', bookingData.moviePoster); // Debug
    }
    
    // Update seat information - with extra debugging
    console.log('Calling updateSeatSummary with:', bookingData.selectedSeats);
    updateSeatSummary(bookingData.selectedSeats || []);
    
    // Update pricing
    updatePricingSummary(bookingData);
    
    // Pre-fill customer information
    const userData = getUserData();
    if (userData) {
        const customerElements = {
            'customer-name': userData.fullName || userData.name || '',
            'customer-email': userData.email || '',
            'customer-phone': userData.phone || ''
        };
        
        Object.keys(customerElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = customerElements[id];
                console.log(`Pre-filled ${id}:`, customerElements[id]); // Debug
            }
        });
    }
}

function updateSeatSummary(selectedSeats) {
    const seatsContainer = document.getElementById('summary-seats');
    
    console.log('Updating seat summary with:', selectedSeats); // Debug
    
    if (!seatsContainer) {
        console.warn('Element with ID "summary-seats" not found!');
        return;
    }
    
    if (!selectedSeats || selectedSeats.length === 0) {
        seatsContainer.innerHTML = '<p class="text-muted">Chưa chọn ghế</p>';
        return;
    }
    
    const seatsHtml = selectedSeats.map(seat => {
        const seatClass = seat.type === 'vip' ? 'seat-tag vip' : 'seat-tag';
        return `<span class="${seatClass}">${seat.row}${seat.number}</span>`;
    }).join('');
    
    seatsContainer.innerHTML = seatsHtml;
    console.log('Seat summary updated with HTML:', seatsHtml); // Debug
}

function updatePricingSummary(bookingData) {
    const selectedSeats = bookingData.selectedSeats || [];
    const normalPrice = parseInt(bookingData.normalPrice) || 75000;
    const vipPrice = parseInt(bookingData.vipPrice) || 100000;
    const serviceFee = 5000;
    
    console.log('Updating pricing with seats:', selectedSeats); // Debug
    
    // Count seats by type
    const normalSeats = selectedSeats.filter(seat => seat.type === 'normal');
    const vipSeats = selectedSeats.filter(seat => seat.type === 'vip');
    
    const normalCount = normalSeats.length;
    const vipCount = vipSeats.length;
    
    const normalTotal = normalCount * normalPrice;
    const vipTotal = vipCount * vipPrice;
    const subtotal = normalTotal + vipTotal;
    const finalTotal = subtotal + serviceFee;
    
    console.log('Price calculation:', { normalCount, vipCount, normalTotal, vipTotal, finalTotal }); // Debug
    
    // Update display elements - với error checking
    const elements = {
        'normal-count': normalCount,
        'vip-count': vipCount,
        'normal-total': formatCurrency(normalTotal),
        'vip-total': formatCurrency(vipTotal),
        'service-fee': formatCurrency(serviceFee),
        'final-total': formatCurrency(finalTotal)
    };
    
    // Cập nhật từng element với error checking
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
            console.log(`Updated ${id}:`, elements[id]); // Debug
        } else {
            console.warn(`Element with ID '${id}' not found!`);
        }
    });
    
    // Hide/show price items based on count
    const normalPriceItem = document.querySelector('.price-item.normal-price');
    const vipPriceItem = document.querySelector('.price-item.vip-price');
    
    if (normalPriceItem) {
        normalPriceItem.style.display = normalCount > 0 ? 'flex' : 'none';
    }
    if (vipPriceItem) {
        vipPriceItem.style.display = vipCount > 0 ? 'flex' : 'none';
    }
    
    // Store for payment processing
    window.paymentData = {
        normalCount,
        vipCount,
        normalTotal,
        vipTotal,
        serviceFee,
        finalTotal,
        selectedSeats,
        bookingData
    };
}

function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const forms = {
        'credit-card': document.getElementById('credit-card-form'),
        'momo': document.getElementById('momo-form'),
        'bank-transfer': document.getElementById('bank-transfer-form'),
        'cash': document.getElementById('cash-form')
    };
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all forms
            Object.values(forms).forEach(form => {
                if (form) form.style.display = 'none';
            });
            
            // Show selected form
            const selectedForm = forms[this.value];
            if (selectedForm) {
                selectedForm.style.display = 'block';
            }
            
            // Update payment button text
            updatePaymentButtonText(this.value);
        });
    });
}

function updatePaymentButtonText(method) {
    const button = document.getElementById('btn-payment');
    const texts = {
        'credit-card': '<i class="fa fa-credit-card"></i> Thanh toán bằng thẻ',
        'momo': '<i class="fa fa-mobile"></i> Thanh toán MoMo',
        'bank-transfer': '<i class="fa fa-university"></i> Xác nhận chuyển khoản',
        'cash': '<i class="fa fa-money"></i> Xác nhận đặt vé'
    };
    
    button.innerHTML = texts[method] || '<i class="fa fa-credit-card"></i> Xác nhận thanh toán';
}

function setupCardFormatting() {
    // Format card number
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV numeric only
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}


// === Added: Seed order to server & lock seats ===
async function seedOrderToServer(selectedMethod) {
    const bookingData = getBookingData();
    if (!bookingData) throw new Error('Thiếu bookingData');

    // Try to read showtime_id from bookingData or URL
    const urlParams = new URLSearchParams(location.search);
    const showtimeId = parseInt(bookingData.showtimeId || urlParams.get('showtime_id') || 0, 10);
    if (!showtimeId) throw new Error('Thiếu showtime_id');

    const normalPrice = parseInt(bookingData.normalPrice) || 75000;
    const vipPrice    = parseInt(bookingData.vipPrice)    || 100000;

    const seatsPayload = (bookingData.selectedSeats || []).map(s => ({
        code: `${s.row || ''}${s.number || ''}`.toUpperCase(),
        type: (s.type || 'normal'),
        price: (s.type === 'vip') ? vipPrice : normalPrice
    })).filter(x => x.code);

    if (!seatsPayload.length) throw new Error('Chưa có ghế nào được chọn');

    const payload = {
        showtime_id: showtimeId,
        payment_method: selectedMethod || 'Test',
        user_id: (getUserData() && getUserData().id) ? parseInt(getUserData().id) : 0,
        customer: getCustomerInfo(),
        seats: seatsPayload
    };

    const res = await fetch('/backend/apis/orders/create.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({ok:false,message:'Response không phải JSON'}));
    if (!res.ok || !data.ok) {
        throw new Error(data.message || ('HTTP '+res.status));
    }

    // Save order id/code for later use
    const orderCode = data.order_code || ('ORD'+data.order_id);
    localStorage.setItem('currentOrderId', orderCode);
    if (document.getElementById('transfer-content')) {
        document.getElementById('transfer-content').textContent = `THANHTOAN ${orderCode}`;
    }
    return data;
}

function processPayment() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    if (!selectedMethod) { showAlert('Vui lòng chọn phương thức thanh toán', 'warning'); return; }

    // Validate customer information
    if (!validateCustomerInfo()) { return; }
    // Validate payment method specific fields
    if (!validatePaymentMethod(selectedMethod)) { return; }

    // Show loading
    const button = document.getElementById('btn-payment');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xử lý...';
    button.disabled = true;

    (async () => {
        try {
            // 1) Create order & lock seats on server
            const seed = await seedOrderToServer(selectedMethod);
            console.log('Order created:', seed);

            // 2) Continue with existing simulated flow
            processPaymentByMethod(selectedMethod);
        } catch (err) {
            console.error(err);
            showAlert('Không thể tạo đơn/giữ ghế: ' + err.message, 'error');
            resetPaymentButton();
        }
    })();
}

function validateCustomerInfo() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    
    if (!name) {
        showAlert('Vui lòng nhập họ tên', 'error');
        return false;
    }
    
    if (!phone) {
        showAlert('Vui lòng nhập số điện thoại', 'error');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showAlert('Vui lòng nhập email hợp lệ', 'error');
        return false;
    }
    
    return true;
}

function validatePaymentMethod(method) {
    switch (method) {
        case 'credit-card':
            return validateCreditCard();
        case 'momo':
            return validateMoMo();
        case 'bank-transfer':
        case 'cash':
            return true;
        default:
            return false;
    }
}

function validateCreditCard() {
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!cardName) {
        showAlert('Vui lòng nhập tên chủ thẻ', 'error');
        return false;
    }
    
    if (!cardNumber || cardNumber.length < 13) {
        showAlert('Vui lòng nhập số thẻ hợp lệ', 'error');
        return false;
    }
    
    if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
        showAlert('Vui lòng nhập ngày hết hạn hợp lệ (MM/YY)', 'error');
        return false;
    }
    
    if (!cvv || cvv.length < 3) {
        showAlert('Vui lòng nhập CVV hợp lệ', 'error');
        return false;
    }
    
    return true;
}

function validateMoMo() {
    const phone = document.getElementById('momo-phone-number').value.trim();
    
    if (!phone) {
        showAlert('Vui lòng nhập số điện thoại MoMo', 'error');
        return false;
    }
    
    if (!phone.match(/^0\d{9}$/)) {
        showAlert('Vui lòng nhập số điện thoại hợp lệ', 'error');
        return false;
    }
    
    return true;
}

function processPaymentByMethod(method) {
    const orderId = localStorage.getItem('currentOrderId');
    const bookingData = getBookingData();
    const customerInfo = getCustomerInfo();
    
    const paymentInfo = {
        orderId,
        method,
        amount: window.paymentData.finalTotal,
        bookingData,
        customerInfo,
        timestamp: new Date().toISOString()
    };
    
    // Store payment info
    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
    
    // Process based on method
    switch (method) {
        case 'credit-card':
            processCreditCardPayment(paymentInfo);
            break;
        case 'momo':
            processMoMoPayment(paymentInfo);
            break;
        case 'bank-transfer':
            processBankTransferPayment(paymentInfo);
            break;
        case 'cash':
            processCashPayment(paymentInfo);
            break;
    }
}

function processCreditCardPayment(paymentInfo) {
    // Simulate API call
    showAlert('Thanh toán thành công!', 'success');
    setTimeout(() => {
        window.location.href = 'e-ticket.html?orderId=' + paymentInfo.orderId;
    }, 1500);
}

function processMoMoPayment(paymentInfo) {
    showAlert('Vui lòng mở ứng dụng MoMo và quét mã QR để thanh toán', 'info');
    // Generate QR code (placeholder)
    setTimeout(() => {
        if (confirm('Bạn đã hoàn thành thanh toán trên MoMo?')) {
            showAlert('Thanh toán thành công!', 'success');
            setTimeout(() => {
                window.location.href = 'e-ticket.html?orderId=' + paymentInfo.orderId;
            }, 1500);
        } else {
            resetPaymentButton();
        }
    }, 3000);
}

function processBankTransferPayment(paymentInfo) {
    showAlert('Vui lòng chuyển khoản theo thông tin trên và chờ xác nhận', 'info');
    setTimeout(() => {
        window.location.href = 'e-ticket.html?orderId=' + paymentInfo.orderId + '&pending=true';
    }, 2000);
}

function processCashPayment(paymentInfo) {
    showAlert('Đặt vé thành công! Vui lòng thanh toán tại quầy trước giờ chiếu', 'success');
    setTimeout(() => {
        window.location.href = 'e-ticket.html?orderId=' + paymentInfo.orderId + '&cash=true';
    }, 1500);
}

function resetPaymentButton() {
    const button = document.getElementById('btn-payment');
    const method = document.querySelector('input[name="payment-method"]:checked').value;
    updatePaymentButtonText(method);
    button.disabled = false;
}

// Debugging function
function debugElements() {
    const requiredElements = [
        'summary-title', 'summary-date', 'summary-time', 'summary-cinema',
        'summary-poster', 'summary-seats', 'normal-count', 'vip-count',
        'normal-total', 'vip-total', 'service-fee', 'final-total'
    ];
    
    console.log('=== Checking Required Elements ===');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? 'FOUND' : 'MISSING');
    });
    
    const bookingData = getBookingData();
    console.log('=== Booking Data ===', bookingData);
}

// Utility functions
function getBookingData() {
    const data = localStorage.getItem('bookingData');
    return data ? JSON.parse(data) : null;
}

function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

function getCustomerInfo() {
    return {
        name: document.getElementById('customer-name').value.trim(),
        phone: document.getElementById('customer-phone').value.trim(),
        email: document.getElementById('customer-email').value.trim()
    };
}

function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `NX${timestamp.slice(-6)}${random}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.maxWidth = '400px';
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    alert.innerHTML = `
        <i class="fa ${icons[type]}"></i> ${message}
        <button type="button" class="close" onclick="this.parentElement.remove()">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Debug function to test with sample data
function testWithSampleData() {
    const sampleData = {
        movieId: 1,
        movieTitle: "Mưa đỏ",
        moviePoster: "assets/images/banner1.jpg",
        showtimeId: 1,
        showDate: "Thứ Bảy, 30 tháng 8, 2025",
        showTime: "02:00 PM",
        cinemaName: "CGV Vincom Đồng Khởi",
        hallName: "Phòng chiếu 1",
        format: "2D",
        selectedSeats: [
            {
                id: "E1",
                row: "E",
                number: "1",
                type: "normal",
                price: 75000
            },
            {
                id: "F5",
                row: "F", 
                number: "5",
                type: "vip",
                price: 100000
            }
        ],
        normalPrice: 75000,
        vipPrice: 100000,
        totalAmount: 175000,
        timestamp: new Date().toISOString()
    };
    
    console.log('Setting sample data with seats:', sampleData.selectedSeats);
    localStorage.setItem('bookingData', JSON.stringify(sampleData));
    
    // Force reload data
    location.reload();
}

// Debug function to check elements
function debugElements() {
    const requiredElements = [
        'summary-title', 'summary-date', 'summary-time', 'summary-cinema',
        'summary-poster', 'summary-seats', 'normal-count', 'vip-count',
        'normal-total', 'vip-total', 'service-fee', 'final-total'
    ];
    
    console.log('=== Checking Required Elements ===');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? 'FOUND' : 'MISSING');
    });
    
    const bookingData = getBookingData();
    console.log('=== Booking Data ===', bookingData);
}

// Make functions available globally for testing
window.testWithSampleData = testWithSampleData;
window.debugElements = debugElements;