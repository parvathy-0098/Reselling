const addProductManager = {
    editMode: false,
    productId: null,

    async init() {
        if (!auth.requireAuth()) return;
        
        // Check if editing
        this.productId = utils.getQueryParam('id');
        if (this.productId) {
            this.editMode = true;
            document.getElementById('pageTitle').textContent = 'Edit Product';
            document.getElementById('submitBtn').textContent = 'Update Product';
            await this.loadProductForEdit(this.productId);
        }
        
        await this.loadCategories();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        const imageUrlInput = document.getElementById('image_url');
        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', utils.debounce(() => {
                this.previewImageUrl(imageUrlInput.value);
            }, 500));
        }
    },

    async loadCategories() {
        try {
            const response = await api.get('/categories');
            const categories = response.data || response;
            const select = document.getElementById('category_id');
            
            if (select) {
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    async loadProductForEdit(id) {
        try {
            const response = await api.get(`/products/${id}`);
            const product = response.data;
            
            // Check ownership
            const user = auth.getUser();
            if (product.seller_id !== user.id) {
                utils.showNotification('You can only edit your own products', 'error');
                window.location.href = 'my-products.html';
                return;
            }
            
            // Fill form
            const form = document.getElementById('productForm');
            if (form) {
                form.title.value = product.title;
                form.description.value = product.description;
                form.category_id.value = product.category_id;
                form.condition.value = product.condition;
                form.brand.value = product.brand || '';
                form.model.value = product.model || '';
                form.price.value = product.price;
                form.quantity.value = product.quantity || 1;
                form.location.value = product.location || '';
                form.image_url.value = product.image_url || '';
            }
            
            // Show existing image
            if (product.image_url) {
                this.previewImageUrl(product.image_url);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            utils.showNotification('Error loading product', 'error');
        }
    },

    previewImageUrl(url) {
        const preview = document.getElementById('imagePreview');
        if (!preview) return;
        
        if (!url) {
            preview.innerHTML = '';
            return;
        }
        
        // Basic URL validation
        try {
            new URL(url);
            preview.innerHTML = `
                <img src="${url}" alt="Product preview" 
                     onerror="this.onerror=null; this.src='${CONFIG.DEFAULT_IMAGE}'; 
                              addProductManager.showImageError();">
                <p class="image-status" id="imageStatus"></p>
            `;
        } catch (e) {
            preview.innerHTML = '<p class="text-danger">Invalid URL</p>';
        }
    },

    showImageError() {
        const status = document.getElementById('imageStatus');
        if (status) {
            status.innerHTML = '<span class="text-danger">Failed to load image. Using placeholder.</span>';
        }
    },

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        
        if (!utils.validateForm(form)) {
            utils.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        try {
            const data = {
                title: form.title.value,
                description: form.description.value,
                category_id: parseInt(form.category_id.value),
                condition: form.condition.value,
                brand: form.brand.value || null,
                model: form.model.value || null,
                price: parseFloat(form.price.value),
                quantity: parseInt(form.quantity.value) || 1,
                location: form.location.value || null,
                image_url: form.image_url.value || null
            };
            
            let response;
            if (this.editMode) {
                response = await api.put(`/products/${this.productId}`, data);
            } else {
                response = await api.post('/products', data);
            }
            
            if (response.success) {
                utils.showNotification(
                    this.editMode ? 'Product updated successfully!' : 'Product listed successfully!', 
                    'success'
                );
                setTimeout(() => {
                    window.location.href = 'my-products.html';
                }, 1500);
            }
        } catch (error) {
            utils.showNotification(error.message || 'Error saving product', 'error');
        }
    }
};