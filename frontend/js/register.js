const registerManager = {
    init() {
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', this.handleRegister.bind(this));
            
            // Add password match validation
            const confirmPassword = form.confirmPassword;
            if (confirmPassword) {
                confirmPassword.addEventListener('blur', this.validatePasswordMatch.bind(this));
            }
        }
    },

    validatePasswordMatch() {
        const form = document.getElementById('registerForm');
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const errorDiv = document.getElementById('errorMessage');
        
        if (confirmPassword && password !== confirmPassword) {
            form.confirmPassword.classList.add('error');
            if (errorDiv) {
                errorDiv.textContent = 'Passwords do not match';
            }
            return false;
        } else {
            form.confirmPassword.classList.remove('error');
            if (errorDiv && errorDiv.textContent === 'Passwords do not match') {
                errorDiv.textContent = '';
            }
            return true;
        }
    },

    async handleRegister(event) {
        event.preventDefault();
        const form = event.target;
        const errorDiv = document.getElementById('errorMessage');
        
        // Clear previous errors
        if (errorDiv) errorDiv.textContent = '';
        
        // Validate form
        if (!utils.validateForm(form)) {
            return;
        }
        
        // Validate password match
        if (!this.validatePasswordMatch()) {
            return;
        }
        
        try {
            const data = {
                username: form.username.value,
                email: form.email.value,
                full_name: form.full_name.value,
                password: form.password.value,
                phone: form.phone.value || null,
                address: form.address.value || null,
                city: form.city.value || null,
                state: form.state.value || null,
                zip_code: form.zip_code.value || null
            };
            
            const response = await api.post('/auth/register', data);
            
            if (response.success && response.data) {
                auth.saveAuth(response.data.token, response.data.user);
                utils.showNotification('Registration successful! Welcome!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            }
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = error.message || 'Registration failed. Please try again.';
            }
            utils.showNotification('Registration failed', 'error');
        }
    }
};
