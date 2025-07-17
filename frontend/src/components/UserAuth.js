class UserAuth {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await api.login({ email, password });
            api.setToken(response.token);
            window.showMessage('Login successful!', 'success');
            this.hideAuthForms();
            if (window.auth) {
                window.auth.updateAuthUI();
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
            window.showMessage('Registration successful!', 'success');
            this.hideAuthForms();
            if (window.auth) {
                window.auth.updateAuthUI();
            }
        } catch (error) {
            window.showMessage(error.message, 'error');
        }
    }

    hideAuthForms() {
        document.getElementById('auth-section').style.display = 'none';
    }
}