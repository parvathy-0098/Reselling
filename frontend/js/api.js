

// frontend/js/api.js
const api = {
    // Get token from localStorage
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    // Build headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },

    // Handle API response
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem(CONFIG.TOKEN_KEY);
                localStorage.removeItem(CONFIG.USER_KEY);
                window.location.href = 'login.html';
            }
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    },

    // GET request
    async get(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${CONFIG.API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    // POST request
    async post(endpoint, data = {}, isFormData = false) {
        try {
            const options = {
                method: 'POST',
                headers: isFormData ? { 'Authorization': `Bearer ${this.getToken()}` } : this.getHeaders(),
                body: isFormData ? data : JSON.stringify(data)
            };
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    // PUT request
    async put(endpoint, data = {}, isFormData = false) {
        try {
            const options = {
                method: 'PUT',
                headers: isFormData ? { 'Authorization': `Bearer ${this.getToken()}` } : this.getHeaders(),
                body: isFormData ? data : JSON.stringify(data)
            };
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    // DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};