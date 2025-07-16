const myProductsManager = {
    currentStatus: 'available',

    async init() {
        if (!auth.requireAuth()) return;
        await this.loadMyProducts('available');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Tab buttons
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const status = e.target.textContent.toLowerCase();
                if (status === 'active') {
                    this.loadMyProducts('available');
                } else if (status === 'sold') {
                    this.loadMyProducts('sold');
                } else {
                    this.loadMyProducts('all');
                }
            });
        });
    },

    async loadMyProducts(status) {
        this.currentStatus = status;
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        utils.showLoading(container);
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            const tabText = tab.textContent.toLowerCase();
            if ((status === 'available' && tabText === 'active') ||
                (status === status && tabText === status) ||
                (status === 'all' && tabText === 'all')) {
                tab.classList.add('active');
            }
        });
        
        try {
            const user = auth.getUser();
            const response = await api.get(`/products/seller/${user.id}`);
            let products = response.data || response || [];
            
            // Filter by status if not "all"
            if (status !== 'all') {
                products = products.filter(p => p.status === status);
            }
            
            this.updateStats(products);
            this.displayProducts(products);
        } catch (error) {
            utils.showError(container, 'Error loading products');
            console.error('Error loading products:', error);
        }
    },

    updateStats(allProducts) {
        const active = allProducts.filter(p => p.status === 'available').length;
        const sold = allProducts.filter(p => p.status === 'sold').length;
        const views = allProducts.reduce((sum, p) => sum + (p.views || 0), 0);
        
        document.getElementById('totalActive').textContent = active;
        document.getElementById('totalSold').textContent = sold;
        document.getElementById('totalViews').textContent = views;
    },

    displayProducts(products) {
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <p>No ${this.currentStatus === 'all' ? '' : this.currentStatus} products found.</p>
                    <a href="add-product.html" class="btn-primary">List Your First Product</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="my-product-item">
                <img src="${product.image_url || CONFIG.DEFAULT_IMAGE}" 
                     alt="${utils.escapeHtml(product.title)}"
                     onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                <div class="product-details">
                    <h3>${utils.escapeHtml(product.title)}</h3>
                    <p class="product-meta">
                        <span>${utils.escapeHtml(product.category_name || '')}</span>
                        <span>•</span>
                        <span>${utils.formatCondition(product.condition)}</span>
                        <span>•</span>
                        <span>${product.views || 0} views</span>
                    </p>
                    <p class="price">${utils.formatPrice(product.price)}</p>
                    <p class="status status-${product.status}">${product.status}</p>
                </div>
                <div class="product-actions">
                    <a href="product-detail.html?id=${product.id}" class="btn-secondary">View</a>
                    ${product.status === 'available' ? `
                        <a href="add-product.html?id=${product.id}" class="btn-primary">Edit</a>
                        <button onclick="myProductsManager.deleteProduct(${product.id})" class="btn-danger">Delete</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await api.delete(`/products/${productId}`);
            
            if (response.success) {
                utils.showNotification('Product deleted successfully', 'success');
                await this.loadMyProducts(this.currentStatus);
            }
        } catch (error) {
            utils.showNotification('Error deleting product', 'error');
        }
    }
};
