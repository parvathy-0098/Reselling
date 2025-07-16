const productDetail = {
    currentProduct: null,

    async init() {
        const productId = utils.getQueryParam('id');
        if (!productId) {
            window.location.href = 'products.html';
            return;
        }
        
        await this.loadProduct(productId);
    },

    async loadProduct(productId) {
        const container = document.getElementById('productDetail');
        if (!container) return;
        
        utils.showLoading(container);

        try {
            const response = await api.get(`/products/${productId}`);
            
            if (response.success && response.data) {
                this.currentProduct = response.data;
                this.displayProduct(response.data);
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            utils.showError(container, 'Error loading product details');
            console.error('Error loading product:', error);
        }
    },

    displayProduct(product) {
        const container = document.getElementById('productDetail');
        if (!container) return;

        const user = auth.getUser();
        const isOwner = user && user.id === product.seller_id;
        const isAvailable = product.status === 'available';

        container.innerHTML = `
            <div class="product-images">
                <img src="${product.image_url || CONFIG.DEFAULT_IMAGE}" 
                     alt="${utils.escapeHtml(product.title)}"
                     onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
            </div>
            
            <div class="product-info-detail">
                <h1>${utils.escapeHtml(product.title)}</h1>
                <p class="product-meta">
                    <span class="category">${utils.escapeHtml(product.category_name || '')}</span>
                    <span class="views">${product.views || 0} views</span>
                    <span class="favorites">${product.favorite_count || 0} favorites</span>
                </p>
                
                <div class="price-section">
                    <h2 class="price">${utils.formatPrice(product.price)}</h2>
                    <p class="condition">Condition: <strong>${utils.formatCondition(product.condition)}</strong></p>
                </div>
                
                <div class="product-details">
                    <h3>Description</h3>
                    <p>${utils.escapeHtml(product.description)}</p>
                    
                    ${product.brand ? `<p><strong>Brand:</strong> ${utils.escapeHtml(product.brand)}</p>` : ''}
                    ${product.model ? `<p><strong>Model:</strong> ${utils.escapeHtml(product.model)}</p>` : ''}
                    ${product.quantity > 1 ? `<p><strong>Available Quantity:</strong> ${product.quantity}</p>` : ''}
                    ${product.location ? `<p><strong>Location:</strong> ${utils.escapeHtml(product.location)}</p>` : ''}
                </div>
                
                <div class="seller-info">
                    <h3>Seller Information</h3>
                    <p><strong>${utils.escapeHtml(product.seller_name || 'Unknown')}</strong></p>
                    <p>Member since ${utils.formatDate(product.seller_since)}</p>
                    <p>${product.seller_total_products || 0} products listed</p>
                </div>
                
                <div class="action-buttons">
                    ${this.getActionButtons(product, user, isOwner, isAvailable)}
                </div>
                
                ${this.getReviewsSection(product)}
            </div>
        `;
    },

    getActionButtons(product, user, isOwner, isAvailable) {
        if (!isAvailable) {
            return `<p class="product-unavailable">This product is ${product.status}</p>`;
        }

        if (isOwner) {
            return `
                <a href="add-product.html?id=${product.id}" class="btn-primary">Edit Product</a>
                <button onclick="productDetail.deleteProduct(${product.id})" class="btn-danger">Delete Product</button>
            `;
        }

        if (!user) {
            return `<a href="login.html?redirect=product-detail.html?id=${product.id}" class="btn-primary">Login to Buy</a>`;
        }

        return `
            <button onclick="productDetail.openPurchaseModal()" class="btn-primary">Buy Now</button>
            <button onclick="productDetail.toggleFavorite(${product.id})" class="btn-secondary">
                <span id="favoriteBtn">Add to Favorites</span>
            </button>
            <button onclick="productDetail.contactSeller(${product.seller_id})" class="btn-secondary">Contact Seller</button>
        `;
    },

    getReviewsSection(product) {
        if (!product.reviews || product.reviews.length === 0) {
            return '';
        }

        return `
            <div class="reviews-section">
                <h3>Reviews (${product.reviews.length})</h3>
                <p>Average Rating: ${(product.average_rating || 0).toFixed(1)} / 5</p>
                <div class="reviews-list">
                    ${product.reviews.map(review => `
                        <div class="review">
                            <div class="review-header">
                                <strong>${utils.escapeHtml(review.username)}</strong>
                                <span>${'⭐'.repeat(review.rating)}</span>
                            </div>
                            <p>${utils.escapeHtml(review.comment || '')}</p>
                            <small>${utils.formatDate(review.created_at)}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openPurchaseModal() {
        const modal = document.getElementById('purchaseModal');
        if (!modal || !this.currentProduct) return;

        document.getElementById('modalProductTitle').textContent = this.currentProduct.title;
        document.getElementById('modalProductPrice').textContent = utils.formatPrice(this.currentProduct.price);
        
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.max = this.currentProduct.quantity || 1;
        }

        modal.style.display = 'block';
    },

    closePurchaseModal() {
        const modal = document.getElementById('purchaseModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('purchaseForm').reset();
        }
    },

    async handlePurchase(event) {
        event.preventDefault();
        const form = event.target;

        if (!utils.validateForm(form)) {
            return;
        }

        try {
            const data = {
                product_id: this.currentProduct.id,
                quantity: parseInt(form.quantity.value) || 1,
                shipping_address: form.shipping_address.value,
                payment_method: form.payment_method.value,
                notes: form.notes.value || null
            };

            const response = await api.post('/transactions', data);

            if (response.success) {
                utils.showNotification('Purchase completed successfully!', 'success');
                this.closePurchaseModal();
                setTimeout(() => {
                    window.location.href = 'transactions.html';
                }, 1500);
            }
        } catch (error) {
            utils.showNotification(error.message || 'Purchase failed', 'error');
        }
    },

    async toggleFavorite(productId) {
        try {
            const response = await api.post(`/products/${productId}/favorite`);
            
            if (response.success) {
                const btn = document.getElementById('favoriteBtn');
                if (btn) {
                    btn.textContent = response.favorited ? 'Remove from Favorites' : 'Add to Favorites';
                }
                utils.showNotification(response.message, 'success');
            }
        } catch (error) {
            utils.showNotification('Error toggling favorite', 'error');
        }
    },

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await api.delete(`/products/${productId}`);
            
            if (response.success) {
                utils.showNotification('Product deleted successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'my-products.html';
                }, 1500);
            }
        } catch (error) {
            utils.showNotification('Error deleting product', 'error');
        }
    },

    contactSeller(sellerId) {
        utils.showNotification('Contact seller feature coming soon!', 'info');
    }
};