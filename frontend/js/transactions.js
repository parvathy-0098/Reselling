const transactionsManager = {
    currentType: 'all',
    currentPage: 1,

    async init() {
        if (!auth.requireAuth()) return;
        await this.loadTransactions('all');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Tab buttons
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.target.textContent.toLowerCase();
                this.loadTransactions(type);
            });
        });
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.loadTransactions(this.currentType, 1);
            });
        }
    },

    async loadTransactions(type, page = 1) {
        this.currentType = type;
        this.currentPage = page;
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase() === type) {
                tab.classList.add('active');
            }
        });
        
        const container = document.getElementById('transactionsContainer');
        if (!container) return;
        
        utils.showLoading(container);
        
        try {
            const status = document.getElementById('statusFilter')?.value;
            let endpoint = '/transactions/my';
            
            if (type === 'purchases') {
                endpoint = '/transactions/my/purchases';
            } else if (type === 'sales') {
                endpoint = '/transactions/my/sales';
            }
            
            const params = { page };
            if (status) params.status = status;
            
            const response = await api.get(endpoint, params);
            
            this.displayTransactions(response.data, type);
            
            if (response.data?.pagination) {
                this.displayPagination(response.data.pagination);
            }
        } catch (error) {
            utils.showError(container, 'Error loading transactions');
            console.error('Error loading transactions:', error);
        }
    },

    displayTransactions(data, type) {
        const container = document.getElementById('transactionsContainer');
        if (!container) return;
        
        const transactions = Array.isArray(data) ? data : data?.transactions || [];
        
        if (transactions.length === 0) {
            container.innerHTML = '<p class="no-results">No transactions found.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>${type === 'sales' ? 'Buyer' : type === 'purchases' ? 'Seller' : 'Type'}</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${utils.formatDate(t.created_at)}</td>
                            <td>
                                <a href="product-detail.html?id=${t.product_id}">
                                    ${utils.escapeHtml(t.product_title)}
                                </a>
                            </td>
                            <td>
                                ${type === 'sales' ? utils.escapeHtml(t.buyer_name) : 
                                  type === 'purchases' ? utils.escapeHtml(t.seller_name) : 
                                  t.type}
                            </td>
                            <td>${utils.formatPrice(t.total_price)}</td>
                            <td>
                                <span class="status status-${t.status}">${t.status}</span>
                            </td>
                            <td>
                                ${this.getTransactionActions(t, type)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    getTransactionActions(transaction, type) {
        const actions = [];
        
        // View details
        actions.push(`<button onclick="transactionsManager.viewTransaction(${transaction.id})" class="btn-sm">View</button>`);
        
        // Seller actions
        if ((type === 'sales' || transaction.type === 'sale') && transaction.status === 'pending') {
            actions.push(`<button onclick="transactionsManager.updateStatus(${transaction.id}, 'completed')" class="btn-sm btn-primary">Complete</button>`);
            actions.push(`<button onclick="transactionsManager.updateStatus(${transaction.id}, 'cancelled')" class="btn-sm btn-danger">Cancel</button>`);
        }
        
        return actions.join(' ');
    },

    async viewTransaction(id) {
        try {
            const response = await api.get(`/transactions/${id}`);
            const t = response.data;
            
            // Create modal content
            const modalContent = `
                <h3>Transaction Details</h3>
                <p><strong>Transaction ID:</strong> #${t.id}</p>
                <p><strong>Product:</strong> ${utils.escapeHtml(t.product_title)}</p>
                <p><strong>Price:</strong> ${utils.formatPrice(t.product_price)}</p>
                <p><strong>Quantity:</strong> ${t.quantity}</p>
                <p><strong>Total:</strong> ${utils.formatPrice(t.total_price)}</p>
                <p><strong>Status:</strong> ${t.status}</p>
                <p><strong>Date:</strong> ${utils.formatDateTime(t.created_at)}</p>
                ${t.shipping_address ? `<p><strong>Shipping:</strong> ${utils.escapeHtml(t.shipping_address)}</p>` : ''}
                ${t.tracking_number ? `<p><strong>Tracking:</strong> ${utils.escapeHtml(t.tracking_number)}</p>` : ''}
            `;
            
            // For now, use alert. In production, use a proper modal
            alert(modalContent.replace(/<[^>]*>/g, ''));
        } catch (error) {
            utils.showNotification('Error loading transaction details', 'error');
        }
    },

    async updateStatus(id, status) {
        if (!confirm(`Are you sure you want to mark this transaction as ${status}?`)) return;
        
        try {
            const response = await api.put(`/transactions/${id}/status`, { status });
            
            if (response.success) {
                utils.showNotification('Transaction status updated', 'success');
                await this.loadTransactions(this.currentType, this.currentPage);
            }
        } catch (error) {
            utils.showNotification('Error updating status', 'error');
        }
    },

    displayPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container) return;
        
        const { page = 1, totalPages = 1 } = pagination;
        let html = '';
        
        if (page > 1) {
            html += `<button onclick="transactionsManager.loadTransactions('${this.currentType}', ${page - 1})">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === page) {
                html += `<span class="current-page">${i}</span>`;
            } else {
                html += `<button onclick="transactionsManager.loadTransactions('${this.currentType}', ${i})">${i}</button>`;
            }
        }
        
        if (page < totalPages) {
            html += `<button onclick="transactionsManager.loadTransactions('${this.currentType}', ${page + 1})">Next</button>`;
        }
        
        container.innerHTML = html;
    }
};