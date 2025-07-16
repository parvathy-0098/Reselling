const loginManager = {
    init() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', this.handleLogin.bind(this));
        }
    },

    async handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const errorDiv = document.getElementById('errorMessage');
        
        // Clear previous errors
        if (errorDiv) errorDiv.textContent = '';
        
        if (!utils.validateForm(form)) {
            return;
        }
        
        try {
            const data = {
                email: form.email.value,
                password: form.password.value
            };
            
            const response = await api.post('/auth/login', data);
            
            if (response.success && response.data) {
                auth.saveAuth(response.data.token, response.data.user);
                utils.showNotification('Login successful!', 'success');
                
                // Redirect to intended page or dashboard
                const redirect = utils.getQueryParam('redirect');
                setTimeout(() => {
                    window.location.href = redirect || 'dashboard.html';
                }, 500);
            }
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = error.message || 'Login failed. Please try again.';
            }
            utils.showNotification('Login failed', 'error');
        }
    }
};