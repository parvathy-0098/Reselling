class ProductManager {
    constructor() {
        this.products = [];
        this.currentProduct = null;
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.loadProducts();
    }

    setupNavigation() {
        const homeLink = document.getElementById('home-link');
        const productsLink = document.getElementById('products-link');
        const heroButtons = document.querySelectorAll('#hero-browse-btn, #hero-sell-btn');

        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('home');
        });

        productsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('products');
        });

        heroButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (btn.id === 'hero-sell-btn') {
                    if (!auth.isAuthenticated()) {
                        window.showMessage('Please login to sell products', 'error');
                        auth.showLoginForm();
                        return;
                    }
                    this.showProductForm();
                } else {
                    this.showSection('products');
                }
            });
        });
    }

    showSection(section) {
        // Hide all sections
        document.getElementById('home-section').style.display = 'none';
        document.getElementById('product-section').style.display = 'none';

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        if (section === 'home') {
            document.getElementById('home-section').style.display = 'block';
            document.getElementById('home-link').classList.add('active');
            this.currentSection = 'home';
        } else if (section === 'products') {
            document.getElementById('product-section').style.display = 'block';
            document.getElementById('products-link').classList.add('active');
            this.currentSection = 'products';
        }
    }

    setupEventListeners() {
        document.getElementById('add-product-btn').addEventListener('click', () => {
            if (!auth.isAuthenticated()) {
                window.showMessage('Please login to add products', 'error');
                return;
            }
            this.showProductForm();
        });

        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchProducts();
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProducts();
            }
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.searchProducts();
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideProductForm();
        });

        document.getElementById('product-close').addEventListener('click', () => {
            this.hideProductForm();
        });

        // Close modal when clicking outside
        document.getElementById('product-form').addEventListener('click', (e) => {
            if (e.target.id === 'product-form') {
                this.hideProductForm();
            }
        });
    }

    async loadProducts() {
        try {
            const response = await api.getProducts();
            this.products = response.products;
            this.renderProducts();
        } catch (error) {
            window.showMessage('Failed to load products', 'error');
        }
    }

    async searchProducts() {
        const search = document.getElementById('search-input').value;
        const category = document.getElementById('category-filter').value;

        try {
            const response = await api.getProducts({ search, category });
            this.products = response.products;
            this.renderProducts();
        } catch (error) {
            window.showMessage('Search failed', 'error');
        }
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        if (this.products.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search filters</p>
                </div>
            `;
            return;
        }

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const currentUser = auth.getCurrentUser();
        const isOwner = currentUser && currentUser.id === product.seller_id;

        // Debug logging
        console.log('Current User:', currentUser);
        console.log('Product seller_id:', product.seller_id);
        console.log('Is Owner:', isOwner);

        card.innerHTML = `
            <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">${product.price}</div>
                <span class="product-condition condition-${product.condition.toLowerCase().replace(' ', '-')}">
                    ${product.condition}
                </span>
                <div class="product-description">${product.description || 'No description available'}</div>
                <div class="product-seller">Sold by ${product.seller_name}</div>
                ${currentUser ? `
                    <div class="product-actions">
                        ${isOwner ? `
                            <button onclick="productManager.editProduct(${product.id})" class="btn btn-secondary">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="productManager.deleteProduct(${product.id})" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : `
                            <button onclick="productManager.contactSeller(${product.id})" class="btn btn-primary">
                                <i class="fas fa-envelope"></i> Contact Seller
                            </button>
                        `}
                    </div>
                ` : `
                    <div class="product-actions">
                        <button onclick="auth.showLoginForm()" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt"></i> Login to Contact
                        </button>
                    </div>
                `}
            </div>
        `;

        return card;
    }

    showProductForm(product = null) {
        this.currentProduct = product;
        const modal = document.getElementById('product-form');
        const title = document.getElementById('form-title');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Edit Product';
            this.populateForm(product);
        } else {
            title.textContent = 'Add New Product';
            form.reset();
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideProductForm() {
        document.getElementById('product-form').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentProduct = null;
    }

    populateForm(product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-condition').value = product.condition;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image').value = product.image_url || '';
    }

    async handleProductSubmit() {
        const formData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            condition: document.getElementById('product-condition').value,
            description: document.getElementById('product-description').value,
            image_url: document.getElementById('product-image').value || null,
        };

        try {
            if (this.currentProduct) {
                await api.updateProduct(this.currentProduct.id, formData);
                window.showMessage('Product updated successfully!', 'success');
            } else {
                await api.createProduct(formData);
                window.showMessage('Product created successfully!', 'success');
            }

            this.hideProductForm();
            this.loadProducts();
        } catch (error) {
            window.showMessage(error.message, 'error');
        }
    }

    async editProduct(id) {
        try {
            const response = await api.getProduct(id);
            this.showProductForm(response.product);
        } catch (error) {
            window.showMessage('Failed to load product', 'error');
        }
    }

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.deleteProduct(id);
                window.showMessage('Product deleted successfully!', 'success');
                this.loadProducts();
            } catch (error) {
                window.showMessage(error.message, 'error');
            }
        }
    }

    contactSeller(productId) {
        window.showMessage('Contact seller feature coming soon!', 'info');
    }
}

// Utility function for showing messages
window.showMessage = (message, type = 'info') => {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});