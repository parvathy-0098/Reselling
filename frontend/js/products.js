const productsManager = {
    currentPage: 1,
    currentFilters: {},
    
    // Initialize products page
    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keyup', utils.debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.loadProducts(1);
            }, 500));
        }

        // Filter form
        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyFilters();
            });
        }

        // Sort select
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    },

    // Load categories
    async loadCategories() {
        try {
            const response = await api.get('/categories');
            const categories = response.data || response;
            
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    categoryFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    // Load products
    async loadProducts(page = 1) {
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        utils.showLoading(container);
        this.currentPage = page;

        try {
            // Get search from URL if present
            const urlSearch = utils.getQueryParam('search');
            const urlCategory = utils.getQueryParam('category');
            
            if (urlSearch && !this.currentFilters.search) {
                this.currentFilters.search = urlSearch;
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = urlSearch;
            }
            
            if (urlCategory && !this.currentFilters.category) {
                this.currentFilters.category = urlCategory;
                const categoryFilter = document.getElementById('categoryFilter');
                if (categoryFilter) categoryFilter.value = urlCategory;
            }

            const params = {
                page,
                limit: CONFIG.ITEMS_PER_PAGE,
                ...this.currentFilters
            };

            const response = await api.get('/products', params);
            
            if (response.success && response.data) {
                this.displayProducts(response.data.products || []);
                this.displayPagination(response.data.pagination || {});
                this.updateResultsCount(response.data.pagination || {});
            }
        } catch (error) {
            utils.showError(container, 'Failed to load products. Please try again.');
            console.error('Error loading products:', error);
        }
    },

    // Display products
    displayProducts(products) {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p class="no-results">No products found.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <img src="${product.image_url || CONFIG.DEFAULT_IMAGE}" 
                     alt="${utils.escapeHtml(product.title)}"
                     onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                <div class="product-info">
                    <h3>${utils.escapeHtml(product.title)}</h3>
                    <p class="price">${utils.formatPrice(product.price)}</p>
                    <p class="condition">Condition: ${utils.formatCondition(product.condition)}</p>
                    <p class="category">${utils.escapeHtml(product.category_name || '')}</p>
                    <p class="seller">by ${utils.escapeHtml(product.seller_name || 'Unknown')}</p>
                    <p class="views">${product.views || 0} views</p>
                </div>
            </div>
        `).join('');
    },

    // Display pagination
    displayPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container) return;

        const { page = 1, totalPages = 1 } = pagination;
        let html = '';

        // Previous button
        if (page > 1) {
            html += `<button onclick="productsManager.loadProducts(${page - 1})">Previous</button>`;
        }

        // Page numbers
        const maxButtons = 5;
        let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === page) {
                html += `<span class="current-page">${i}</span>`;
            } else {
                html += `<button onclick="productsManager.loadProducts(${i})">${i}</button>`;
            }
        }

        // Next button
        if (page < totalPages) {
            html += `<button onclick="productsManager.loadProducts(${page + 1})">Next</button>`;
        }

        container.innerHTML = html;
    },

    // Update results count
    updateResultsCount(pagination) {
        const countElement = document.getElementById('resultsCount');
        if (countElement && pagination.total !== undefined) {
            countElement.textContent = `Found ${pagination.total} products`;
        }
    },

    // Apply filters
    applyFilters() {
        const form = document.getElementById('filterForm');
        if (!form) return;

        const formData = new FormData(form);
        this.currentFilters = {};

        // Build filters
        for (let [key, value] of formData.entries()) {
            if (value && value !== '') {
                this.currentFilters[key] = value;
            }
        }

        // Handle sort
        const sortBy = form.sortBy?.value;
        if (sortBy) {
            if (sortBy === 'price-desc') {
                this.currentFilters.sortBy = 'price';
                this.currentFilters.order = 'desc';
            } else if (sortBy === 'created_at') {
                this.currentFilters.sortBy = 'created_at';
                this.currentFilters.order = 'desc';
            } else {
                this.currentFilters.sortBy = sortBy;
                this.currentFilters.order = 'asc';
            }
        }

        this.loadProducts(1);
    },

    // Reset filters
    resetFilters() {
        const form = document.getElementById('filterForm');
        if (form) form.reset();
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        this.currentFilters = {};
        this.loadProducts(1);
    }
};