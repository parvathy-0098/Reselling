const dashboard = {
    async init() {
        if (!auth.requireAuth()) return;
        await this.loadDashboardData();
    },

    async loadDashboardData() {
        try {
            const user = auth.getUser();
            
            // Update user info
            document.getElementById('userName').textContent = user.full_name || user.username;
            document.getElementById('memberSince').textContent = utils.formatDate(user.created_at);

            // Load data in parallel
            const [productsResponse, transactionsResponse] = await Promise.all([
                api.get(`/products/seller/${user.id}`),
                api.get('/transactions/my')
            ]);

            // Process data
            const products = productsResponse.data || productsResponse || [];
            const transactions = transactionsResponse.data?.transactions || [];

            // Calculate statistics
            const stats = this.calculateStats(products, transactions);
            this.updateStats(stats);

            // Display recent activities
            this.displayRecentActivities(transactions.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
            utils.showNotification('Error loading dashboard data', 'error');
        }
    },

    calculateStats(products, transactions) {
        const stats = {
            totalProducts: 0,
            totalSales: 0,
            totalPurchases: 0,
            totalRevenue: 0
        };

        // Count products
        stats.totalProducts = products.filter(p => p.status === 'available').length;

        // Process transactions
        transactions.forEach(t => {
            if (t.type === 'sale' && t.status === 'completed') {
                stats.totalSales++;
                stats.totalRevenue += parseFloat(t.total_price || 0);
            } else if (t.type === 'purchase') {
                stats.totalPurchases++;
            }
        });

        return stats;
    },

    updateStats(stats) {
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalSales').textContent = stats.totalSales;
        document.getElementById('totalPurchases').textContent = stats.totalPurchases;
        document.getElementById('totalRevenue').textContent = utils.formatPrice(stats.totalRevenue);
    },

    displayRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p>No recent activities</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.type === 'sale' ? '💰' : '🛒'}</div>
                <div class="activity-details">
                    <h4>${utils.escapeHtml(activity.product_title)}</h4>
                    <p>${activity.type === 'sale' ? 'Sold to' : 'Purchased from'} 
                       ${utils.escapeHtml(activity.type === 'sale' ? activity.buyer_name : activity.seller_name)}</p>
                    <span class="activity-date">${utils.formatDate(activity.created_at)}</span>
                </div>
                <div class="activity-amount">${utils.formatPrice(activity.total_price)}</div>
            </div>
        `).join('');
    }
};