// frontend/js/navigation.js

// Navigation component management
class Navigation {
    constructor() {
        this.user = getUser();
        this.currentPage = this.getCurrentPage();
        this.mobileMenuOpen = false;
    }
    
    // Get current page from URL
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page || 'index.html';
    }
    
    // Render navigation
    render() {
        const navContainer = document.getElementById('mainNavigation');
        if (!navContainer) {
            this.createNavigation();
            return;
        }
        
        const isLoggedIn = !!this.user;
        const isAdmin = this.user && this.user.role === 'admin';
        
        navContainer.innerHTML = `
            <nav class="navbar">
                <div class="container">
                    <div class="nav-brand">
                        <a href="index.html">
                            <h2>📱 Resale Electronics</h2>
                        </a>
                    </div>
                    
                    <button class="mobile-menu-toggle" onclick="navigation.toggleMobileMenu()">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    
                    <ul class="nav-menu ${this.mobileMenuOpen ? 'active' : ''}">
                        <li><a href="index.html" class="${this.isActive('index.html')}">Home</a></li>
                        <li><a href="products.html" class="${this.isActive('products.html')}">Browse</a></li>
                        
                        ${isLoggedIn ? `
                            <li><a href="dashboard.html" class="${this.isActive('dashboard.html')}">Dashboard</a></li>
                            <li><a href="my-products.html" class="${this.isActive('my-products.html')}">My Products</a></li>
                            <li><a href="add-product.html" class="${this.isActive('add-product.html')}">Sell</a></li>
                            <li><a href="transactions.html" class="${this.isActive('transactions.html')}">Orders</a></li>
                            ${isAdmin ? `<li><a href="admin.html" class="${this.isActive('admin.html')}">Admin</a></li>` : ''}
                            
                            <li class="nav-user-menu">
                                <a href="#" class="user-menu-toggle" onclick="navigation.toggleUserMenu(event)">
                                    <span class="user-avatar">${this.user.username.charAt(0).toUpperCase()}</span>
                                    ${this.user.username}
                                </a>
                                <ul class="user-dropdown" id="userDropdown">
                                    <li><a href="profile.html">Profile</a></li>
                                    <li><a href="messages.html">Messages <span id="messageBadge" class="badge"></span></a></li>
                                    <li><a href="favorites.html">Favorites</a></li>
                                    <li><a href="settings.html">Settings</a></li>
                                    <li class="divider"></li>
                                    <li><a href="#" onclick="logout()">Logout</a></li>
                                </ul>
                            </li>
                        ` : `
                            <li><a href="login.html" class="${this.isActive('login.html')}">Login</a></li>
                            <li><a href="register.html" class="${this.isActive('register.html')}" class="btn-primary nav-btn">Register</a></li>
                        `}
                    </ul>
                </div>
            </nav>
        `;
        
        // Check for unread messages if logged in
        if (isLoggedIn) {
            this.checkUnreadMessages();
        }
    }
    
    // Create navigation if container doesn't exist
    createNavigation() {
        const nav = document.createElement('div');
        nav.id = 'mainNavigation';
        document.body.insertBefore(nav, document.body.firstChild);
        this.render();
    }
    
    // Check if page is active
    isActive(page) {
        return this.currentPage === page ? 'active' : '';
    }
    
    // Toggle mobile menu
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        this.render();
    }
    
    // Toggle user dropdown menu
    toggleUserMenu(event) {
        event.preventDefault();
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-user-menu')) {
                dropdown.classList.remove('show');
            }
        });
    }
    
    // Check unread messages
    async checkUnreadMessages() {
        if (typeof getUnreadMessageCount === 'function') {
            await getUnreadMessageCount();
        }
    }
    
    // Update user info
    updateUser(user) {
        this.user = user;
        this.render();
    }
}

// Create global navigation instance
const navigation = new Navigation();

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    navigation.render();
    
    // Listen for user changes
    window.addEventListener('userChanged', (event) => {
        navigation.updateUser(event.detail);
    });
});

// Search bar component
class SearchBar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            placeholder: 'Search products...',
            onSearch: () => {},
            showFilters: false,
            ...options
        };
        
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="search-container">
                <div class="search-box">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="${this.options.placeholder}"
                           onkeyup="searchBar.handleSearch(event)">
                    <button onclick="searchBar.performSearch()" class="search-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
                
                ${this.options.showFilters ? `
                    <div class="search-filters">
                        <select id="categoryFilter" onchange="searchBar.performSearch()">
                            <option value="">All Categories</option>
                        </select>
                        <select id="conditionFilter" onchange="searchBar.performSearch()">
                            <option value="">Any Condition</option>
                            <option value="new">New</option>
                            <option value="like-new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                        <input type="number" 
                               id="minPriceFilter" 
                               placeholder="Min Price"
                               onchange="searchBar.performSearch()">
                        <input type="number" 
                               id="maxPriceFilter" 
                               placeholder="Max Price"
                               onchange="searchBar.performSearch()">
                    </div>
                ` : ''}
            </div>
        `;
        
        // Load categories if filters are shown
        if (this.options.showFilters) {
            this.loadCategories();
        }
    }
    
    handleSearch(event) {
        if (event.key === 'Enter') {
            this.performSearch();
        }
    }
    
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput ? searchInput.value : '';
        
        const filters = {};
        if (this.options.showFilters) {
            const categoryFilter = document.getElementById('categoryFilter');
            const conditionFilter = document.getElementById('conditionFilter');
            const minPriceFilter = document.getElementById('minPriceFilter');
            const maxPriceFilter = document.getElementById('maxPriceFilter');
            
            if (categoryFilter && categoryFilter.value) filters.category = categoryFilter.value;
            if (conditionFilter && conditionFilter.value) filters.condition = conditionFilter.value;
            if (minPriceFilter && minPriceFilter.value) filters.minPrice = minPriceFilter.value;
            if (maxPriceFilter && maxPriceFilter.value) filters.maxPrice = maxPriceFilter.value;
        }
        
        this.options.onSearch(query, filters);
    }
    
    async loadCategories() {
        try {
            const categories = await api.get('/categories');
            const select = document.getElementById('categoryFilter');
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
    }
}

// Footer component
function renderFooter() {
    const footer = document.getElementById('mainFooter');
    if (!footer) {
        const footerElement = document.createElement('footer');
        footerElement.id = 'mainFooter';
        footerElement.className = 'footer';
        document.body.appendChild(footerElement);
    }
    
    document.getElementById('mainFooter').innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Resale Electronics Portal</h3>
                    <p>Your trusted marketplace for quality used electronics.</p>
                    <div class="social-links">
                        <a href="#" aria-label="Facebook">📘</a>
                        <a href="#" aria-label="Twitter">🐦</a>
                        <a href="#" aria-label="Instagram">📷</a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="products.html">Browse Products</a></li>
                        <li><a href="add-product.html">Sell Your Electronics</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="products.html?category=1">Smartphones</a></li>
                        <li><a href="products.html?category=2">Laptops</a></li>
                        <li><a href="products.html?category=3">Tablets</a></li>
                        <li><a href="products.html?category=4">Cameras</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="help.html">Help Center</a></li>
                        <li><a href="safety.html">Safety Tips</a></li>
                        <li><a href="terms.html">Terms of Service</a></li>
                        <li><a href="privacy.html">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 Resale Electronics Portal. All rights reserved.</p>
                <p>Created for Programming for Information Systems - B9IS123</p>
            </div>
        </div>
    `;
}

// Initialize footer on page load
document.addEventListener('DOMContentLoaded', renderFooter);

// Export components
window.Navigation = Navigation;
window.SearchBar = SearchBar;
window.navigation = navigation;