class ProductList {
    constructor(container) {
        this.container = container;
        this.products = [];
    }

    render(products) {
        this.products = products;
        this.container.innerHTML = '';

        if (products.length === 0) {
            this.container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search filters</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productElement = this.createProductElement(product);
            this.container.appendChild(productElement);
        });
    }

    createProductElement(product) {
        const element = document.createElement('div');
        element.className = 'product-card';
        element.innerHTML = `
            <img src="${product.image_url || 'https://via.placeholder.com/300x200'}" 
                 alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <span class="product-condition condition-${product.condition.toLowerCase().replace(' ', '-')}">
                    ${product.condition}
                </span>
                <div class="product-description">${product.description}</div>
                <div class="product-seller">Seller: ${product.seller_name}</div>
            </div>
        `;
        return element;
    }
}