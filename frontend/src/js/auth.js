class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showLoginForm();
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            this.showRegisterForm();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        document.getElementById('auth-close').addEventListener('click', () => {
            this.hideAuthForms();
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Close modal when clicking outside
        document.getElementById('auth-section').addEventListener('click', (e) => {
            if (e.target.id === 'auth-section') {
                this.hideAuthForms();
            }
        });
    }

    showLoginForm() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('auth-section').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    showRegisterForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('auth-section').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideAuthForms() {
        document.getElementById('auth-section').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await api.login({ email, password });
            api.setToken(response.token);
            this.currentUser = response.user;
            this.updateAuthUI();
            this.hideAuthForms();
            window.showMessage('Welcome back!', 'success');
            if (window.productManager) {
                window.productManager.loadProducts();
            }
        } catch (error) {
            window.showMessage(error.message, 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await api.register({ username, email, password });
            api.setToken(response.token);
            this.currentUser = response.user;
            this.updateAuthUI();
            this.hideAuthForms();
            window.showMessage('Account created successfully!', 'success');
            if (window.productManager) {
                window.productManager.loadProducts();
            }
        } catch (error) {
            window.showMessage(error.message, 'error');
        }
    }

    logout() {
        api.setToken(null);
        this.currentUser = null;
        this.updateAuthUI();
        window.showMessage('Logged out successfully', 'info');
        if (window.productManager) {
            window.productManager.showSection('home');
            window.productManager.loadProducts();
        }
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.getProfile();
                this.currentUser = response.user;
                this.updateAuthUI();
            } catch (error) {
                this.logout();
            }
        }
    }

    updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const username = document.getElementById('username');

        if (this.currentUser) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            username.textContent = this.currentUser.username;
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

window.auth = new Auth();