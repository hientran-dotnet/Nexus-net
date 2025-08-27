// Session Management Class
class SessionManager {
    static saveSession(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('sessionToken', userData.sessionToken || '');
        localStorage.setItem('expiresAt', userData.expiresAt || '');
        console.log('Session saved:', userData); // Debug log
    }

    static getSession() {
        const user = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const expiresAt = localStorage.getItem('expiresAt');

        console.log('Getting session:', { user, isLoggedIn, expiresAt }); // Debug log

        if (!user || !isLoggedIn) {
            console.log('No user or isLoggedIn flag found');
            return null;
        }

        // Kiểm tra hết hạn nếu có expiresAt
        if (expiresAt && new Date(expiresAt) < new Date()) {
            console.log('Session expired');
            this.clearSession();
            return null;
        }

        try {
            return JSON.parse(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.clearSession();
            return null;
        }
    }

    static clearSession() {
        // Xóa tất cả session data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('expiresAt');
        
        // Xóa sessionStorage nếu có
        sessionStorage.removeItem('justLoggedIn');
        
        // Xóa cookies nếu có (backup)
        document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        console.log('Session cleared completely'); // Debug log
    }

    static isLoggedIn() {
        const result = this.getSession() !== null;
        console.log('Is logged in:', result); // Debug log
        return result;
    }

    static async logout() {
        console.log('Logging out...'); // Debug log
        
        try {
            // Gọi API logout để xóa session server-side
            const response = await fetch('https://itdi.io.vn/services/logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            const result = await response.json();
            console.log('Logout API response:', result);
            
        } catch (error) {
            console.log('Logout API error (continuing anyway):', error);
        }
        
        // Xóa session local
        this.clearSession();
        
        // Set flag để hiển thị thông báo đăng xuất thành công
        sessionStorage.setItem('loggedOut', 'true');
        
        // Redirect đến trang login
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            // Đang ở trong thư mục pages
            window.location.href = 'login.html';
        } else {
            // Đang ở trang chủ hoặc thư mục root
            window.location.href = 'pages/login.html';
        }
    }

    static async validateSession() {
        const user = this.getSession();
        if (!user) {
            console.log('No local session found');
            return false;
        }
        
        try {
            // Thử validate với server nếu có
            const response = await fetch('https://itdi.io.vn/services/session.php', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    // Cập nhật user data từ server
                    this.saveSession(result.user);
                    return true;
                } else {
                    console.log('Server session invalid');
                    this.clearSession();
                    return false;
                }
            } else {
                // Server không phản hồi, giữ session local
                console.log('Server not available, keeping local session');
                return true;
            }
            
        } catch (error) {
            console.log('Session validation error, keeping local session:', error);
            // Nếu không kết nối được server, giữ session local
            return true;
        }
    }
}

// User Interface Management
class UserInterface {
    static updateNavigation() {
        console.log('Updating navigation...'); // Debug log
        
        const user = SessionManager.getSession();
        const userProfile = document.getElementById('userProfile');
        const authButtons = document.getElementById('authButtons');
        const userName = document.getElementById('userName');
        const logoutBtn = document.getElementById('logoutBtn');

        console.log('Elements found:', { userProfile, authButtons, userName, logoutBtn }); // Debug log
        console.log('Current user:', user); // Debug log

        if (user) {
            // User đã đăng nhập
            console.log('Showing user profile for:', user.fullName || user.username); // Debug log
            
            if (userProfile) userProfile.classList.remove('hidden');
            if (authButtons) authButtons.classList.add('hidden');
            
            if (userName) {
                userName.textContent = user.fullName || user.username || 'User';
            }
            
            // Gắn event logout
            if (logoutBtn && !logoutBtn.hasAttribute('data-logout-bound')) {
                logoutBtn.setAttribute('data-logout-bound', 'true');
                logoutBtn.onclick = async function() {
                    if (confirm('Bạn có chắc muốn đăng xuất?')) {
                        // Hiển thị loading state
                        logoutBtn.disabled = true;
                        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-lg"></i>';
                        
                        await SessionManager.logout();
                    }
                };
            }
        } else {
            // User chưa đăng nhập
            console.log('Showing auth buttons'); // Debug log
            
            if (userProfile) userProfile.classList.add('hidden');
            if (authButtons) authButtons.classList.remove('hidden');
        }
    }

    static showWelcomeMessage(user) {
        console.log('Showing welcome message for:', user); // Debug log
        
        // Tạo welcome toast
        const welcomeToast = document.createElement('div');
        welcomeToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        welcomeToast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Chào mừng ${user.fullName || user.username}!</span>
            </div>
        `;

        document.body.appendChild(welcomeToast);

        // Animate in
        setTimeout(() => {
            welcomeToast.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            welcomeToast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(welcomeToast)) {
                    document.body.removeChild(welcomeToast);
                }
            }, 300);
        }, 3000);
    }

    static showLogoutMessage() {
        console.log('Showing logout message'); // Debug log
        
        // Tạo logout toast
        const logoutToast = document.createElement('div');
        logoutToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        logoutToast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-sign-out-alt mr-2"></i>
                <span>Đã đăng xuất thành công!</span>
            </div>
        `;

        document.body.appendChild(logoutToast);

        // Animate in
        setTimeout(() => {
            logoutToast.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            logoutToast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(logoutToast)) {
                    document.body.removeChild(logoutToast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize UI khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing UI...'); // Debug log
    
    // Delay một chút để đảm bảo tất cả elements đã load
    setTimeout(() => {
        UserInterface.updateNavigation();
        
        // Show welcome message nếu vừa đăng nhập
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (justLoggedIn === 'true') {
            const user = SessionManager.getSession();
            if (user) {
                UserInterface.showWelcomeMessage(user);
            }
            sessionStorage.removeItem('justLoggedIn');
        }

        // Show logout message nếu vừa đăng xuất
        const loggedOut = sessionStorage.getItem('loggedOut');
        if (loggedOut === 'true') {
            UserInterface.showLogoutMessage();
            sessionStorage.removeItem('loggedOut');
        }
    }, 100);
});

// Expose globally for debugging
window.SessionManager = SessionManager;
window.UserInterface = UserInterface;

