const utils = {
    // Format currency
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format date time
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get query parameter
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Show notification
    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },

    // Show loading
    showLoading(container) {
        container.innerHTML = '<div class="loading">Loading...</div>';
    },

    // Show error
    showError(container, message) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    },

    // Validate email
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validate form
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            const fieldGroup = field.closest('.form-group');
            
            if (!value) {
                field.classList.add('error');
                isValid = false;
                
                // Show error message
                let errorMsg = fieldGroup.querySelector('.field-error');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'field-error';
                    fieldGroup.appendChild(errorMsg);
                }
                errorMsg.textContent = 'This field is required';
            } else {
                field.classList.remove('error');
                const errorMsg = fieldGroup.querySelector('.field-error');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
        
        return isValid;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get category icon
    getCategoryIcon(name) {
        const icons = {
            'Smartphones': '📱',
            'Laptops': '💻',
            'Tablets': '📱',
            'Cameras': '📷',
            'Audio': '🎧',
            'Gaming': '🎮',
            'Wearables': '⌚',
            'Accessories': '🔌',
            'Components': '🖥️',
            'Other': '📦'
        };
        return icons[name] || '📦';
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Validate image file
    validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Please select a valid image file (JPG, PNG, GIF, WebP)', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showNotification('Image size must be less than 5MB', 'error');
            return false;
        }
        
        return true;
    },

    // Preview image
    previewImage(file, previewElement) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    },

    // Format condition
    formatCondition(condition) {
        const conditions = {
            'new': 'New',
            'like-new': 'Like New',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
        };
        return conditions[condition] || condition;
    },

    // Escape HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// Initialize on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    auth.checkAuth();
    
    // Setup logout links
    const logoutLinks = document.querySelectorAll('#logoutLink');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
        });
    });
});