// Authentication functions
let currentUser = null;

function isLoggedIn() {
    return currentUser !== null;
}

function login(email, password) {
    // Simple demo login - in real app, this would validate against server
    if (email && password) {
        currentUser = {
            name: email.split('@')[0],
            email: email
        };
        updateUserInterface();
        return true;
    }
    return false;
}

function register(name, email, password, confirmPassword) {
    // Simple demo registration - in real app, this would save to server
    if (name && email && password && password === confirmPassword) {
        currentUser = { name, email };
        updateUserInterface();
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    updateUserInterface();
    window.location.href = '../index.html';
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userProfile) userProfile.classList.remove('hidden');
        if (userName) userName.textContent = currentUser.name;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userProfile) userProfile.classList.add('hidden');
    }
}

// Event listeners for auth forms
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (login(email, password)) {
                alert('Login successful!');
                window.location.href = '../index.html';
            } else {
                alert('Please enter valid email and password!');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regFullName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            if (register(name, email, password, confirmPassword)) {
                alert('Registration successful!');
                window.location.href = '../index.html';
            } else {
                alert('Please fill all fields correctly and ensure passwords match!');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});