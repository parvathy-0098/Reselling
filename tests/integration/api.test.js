const request = require('supertest');
const app = require('../../backend/server');

describe('API Integration Tests', () => {
    let authToken;
    let productId;

    it('should register a user and create a product', async () => {
        // Register user
        const registerResponse = await request(app)
            .post('/api/users/register')
            .send({
                username: 'integrationtest',
                email: 'integration@test.com',
                password: 'password123'
            });

        expect(registerResponse.status).toBe(201);
        authToken = registerResponse.body.token;

        // Create product
        const productResponse = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Integration Test Product',
                category: 'Testing',
                price: 99.99,
                condition: 'New',
                description: 'Test product for integration testing'
            });

        expect(productResponse.status).toBe(201);
        productId = productResponse.body.product.id;

        // Verify product appears in listing
        const listResponse = await request(app).get('/api/products');
        expect(listResponse.status).toBe(200);
        
        const createdProduct = listResponse.body.products.find(p => p.id === productId);
        expect(createdProduct).toBeDefined();
        expect(createdProduct.name).toBe('Integration Test Product');
    });
});