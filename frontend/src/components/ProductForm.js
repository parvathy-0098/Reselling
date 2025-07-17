class ProductForm {
    constructor() {
        this.form = document.getElementById('productForm');
        this.modal = document.getElementById('product-form');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hide();
        });
    }

    show(product = null) {
        if (product) {
            this.populateForm(product);
            document.getElementById('form-title').textContent = 'Edit Product';
        } else {
            this.form.reset();
            document.getElementById('form-title').textContent = 'Add New Product';
        }
        this.modal.style.display = 'flex';
    }

    hide() {
        this.modal.style.display = 'none';
        this.form.reset();
    }

    populateForm(product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-condition').value = product.condition;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image_url || '';
    }

    getFormData() {
        return {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            condition: document.getElementById('product-condition').value,
            description: document.getElementById('product-description').value,
            image_url: document.getElementById('product-image').value || null,
        };
    }

    async handleSubmit() {
        const formData = this.getFormData();
        const productId = document.getElementById('product-id').value;

        try {
            if (productId) {
                await api.updateProduct(productId, formData);
                window.showMessage('Product updated successfully!', 'success');
            } else {
                await api.createProduct(formData);
                window.showMessage('Product created successfully!', 'success');
            }

            this.hide();
            if (window.productManager) {
                window.productManager.loadProducts();
            }
        } catch (error) {
            window.showMessage(error.message, 'error');
        }
    }
}