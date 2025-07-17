const Product = require('../models/Product');

const productController = {
    async createProduct(req, res) {
        try {
            const productData = {
                ...req.body,
                seller_id: req.user.id
            };

            const product = await Product.create(productData);
            res.status(201).json({
                message: 'Product created successfully',
                product
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    },

    async getAllProducts(req, res) {
        try {
            const filters = {
                category: req.query.category,
                search: req.query.search
            };

            const products = await Product.findAll(filters);
            res.json({ products });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ product });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    },

    async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            
            // Check if product exists and belongs to user
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (existingProduct.seller_id !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized to update this product' });
            }

            const updatedProduct = await Product.update(productId, req.body);
            res.json({
                message: 'Product updated successfully',
                product: updatedProduct
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    },

    async deleteProduct(req, res) {
        try {
            const productId = req.params.id;
            
            // Check if product exists and belongs to user
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (existingProduct.seller_id !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized to delete this product' });
            }

            await Product.delete(productId);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
};

module.exports = productController;