const validators = {
    required(value) {
        return value && value.toString().trim() !== '';
    },
    
    email(value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    },
    
    minLength(value, length) {
        return value && value.length >= length;
    },
    
    maxLength(value, length) {
        return !value || value.length <= length;
    },
    
    phone(value) {
        if (!value) return true;
        const regex = /^[\d\s\-\+\(\)]+$/;
        return regex.test(value);
    },
    
    price(value) {
        return !isNaN(value) && parseFloat(value) >= 0;
    },
    
    imageFile(file) {
        if (!file) return true;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        return allowedTypes.includes(file.type);
    },
    
    fileSize(file, maxSize) {
        if (!file) return true;
        return file.size <= maxSize;
    },
    
    username(value) {
        const regex = /^[a-zA-Z0-9_]+$/;
        return regex.test(value);
    },
    
    password(value) {
        return value && value.length >= 6;
    },
    
    passwordMatch(value, compareValue) {
        return value === compareValue;
    }
};

// Validate field
function validateField(field, rules) {
    const errors = [];
    const value = field.value;
    
    for (const rule of rules) {
        let isValid = true;
        let errorMessage = '';
        
        switch (rule.type) {
            case 'required':
                isValid = validators.required(value);
                errorMessage = rule.message || `${field.placeholder || field.name} is required`;
                break;
                
            case 'email':
                isValid = validators.email(value);
                errorMessage = rule.message || 'Please enter a valid email address';
                break;
                
            case 'minLength':
                isValid = validators.minLength(value, rule.value);
                errorMessage = rule.message || `Must be at least ${rule.value} characters`;
                break;
                
            case 'maxLength':
                isValid = validators.maxLength(value, rule.value);
                errorMessage = rule.message || `Must be no more than ${rule.value} characters`;
                break;
                
            case 'phone':
                isValid = validators.phone(value);
                errorMessage = rule.message || 'Please enter a valid phone number';
                break;
                
            case 'price':
                isValid = validators.price(value);
                errorMessage = rule.message || 'Please enter a valid price';
                break;
                
            case 'username':
                isValid = validators.username(value);
                errorMessage = rule.message || 'Username can only contain letters, numbers, and underscores';
                break;
                
            case 'password':
                isValid = validators.password(value);
                errorMessage = rule.message || 'Password must be at least 6 characters';
                break;
        }
        
        if (!isValid) {
            errors.push(errorMessage);
        }
    }
    
    return errors;
}

// Show field errors
function showFieldError(field, errors) {
    const parent = field.parentElement;
    let errorDiv = parent.querySelector('.field-error');
    
    if (errors.length > 0) {
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            parent.appendChild(errorDiv);
        }
        errorDiv.textContent = errors[0];
        field.classList.add('error');
    } else {
        if (errorDiv) errorDiv.remove();
        field.classList.remove('error');
    }
}

// Setup form validation
function setupFormValidation(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Real-time validation
    Object.keys(validationRules).forEach(fieldName => {
        const field = form.elements[fieldName];
        if (field) {
            // Validate on blur
            field.addEventListener('blur', () => {
                const errors = validateField(field, validationRules[fieldName]);
                showFieldError(field, errors);
            });
            
            // Clear error on input
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    const errors = validateField(field, validationRules[fieldName]);
                    showFieldError(field, errors);
                }
            });
        }
    });
    
    // Form submission validation
    form.addEventListener('submit', (e) => {
        let hasErrors = false;
        
        Object.keys(validationRules).forEach(fieldName => {
            const field = form.elements[fieldName];
            if (field) {
                const errors = validateField(field, validationRules[fieldName]);
                showFieldError(field, errors);
                if (errors.length > 0) hasErrors = true;
            }
        });
        
        if (hasErrors) {
            e.preventDefault();
            showNotification('Please fix the errors before submitting', 'error');
            
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    });
}