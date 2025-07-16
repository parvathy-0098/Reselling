const auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    // Get current user
    getUser() {
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Save auth data
    saveAuth(token, user) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    },

    // Clear auth data
    clearAuth() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    },

    // Logout
    logout() {
        this.clearAuth();
        window.location.href = 'index.html';
    },

    // Check auth and update UI
    checkAuth() {
        const user = this.getUser();
        const isLoggedIn = this.isLoggedIn();
        
        // Update navigation based on auth status
        this.updateNavigation(isLoggedIn, user);
        
        return isLoggedIn;
    },

    // Update navigation links
    updateNavigation(isLoggedIn, user) {
        const authLinksElements = document.querySelectorAll('.auth-links');
        
        authLinksElements.forEach(element => {
            if (isLoggedIn && user) {
                element.innerHTML = `
                    <a href="dashboard.html">Dashboard</a>
                    <a href="my-products.html">My Products</a>
                    <a href="add-product.html">Sell</a>
                    <a href="#" onclick="auth.logout(); return false;">Logout (${user.username})</a>
                `;
            } else {
                element.innerHTML = `
                    <a href="login.html">Login</a>
                    <a href="register.html">Register</a>
                `;
            }
        });

        // Update user menu if exists
        const userMenu = document.getElementById('userMenu');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        
        if (userMenu && loginLink && registerLink) {
            if (isLoggedIn && user) {
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                userMenu.style.display = 'block';
                
                const userNameLink = document.getElementById('userNameLink');
                if (userNameLink) {
                    userNameLink.textContent = user.username;
                }
            } else {
                if (loginLink) loginLink.style.display = 'inline';
                if (registerLink) registerLink.style.display = 'inline';
                if (userMenu) userMenu.style.display = 'none';
            }
        }
    },

    // Require authentication
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }
};
