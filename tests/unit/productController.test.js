const request = require('supertest');
const app = require('../../backend/server');
const { db } = require('../../backend/src/config/database');

describe('Product Controller', () => {
    let authToken;
    let testUserId;

    beforeAll(async () => {
        // Create test user and get token
        const registerResponse = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        authToken = registerResponse.body.token;
        testUserId = registerResponse.body.user.id;
    });

    afterAll(async () => {
        // Clean up test data
        db.run('DELETE FROM products WHERE seller_id = ?', [testUserId]);
        db.run('DELETE FROM users WHERE id = ?', [testUserId]);
    });

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const productData = {
                name: 'Test iPhone',
                category: 'Smartphone',
                price: 599.99,
                condition: 'Good',
                description: 'Test description',
                image_url: 'https://example.com/image.jpg'
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send(productData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Product created successfully');
            expect(response.body.product.name).toBe(productData.name);
        });

        it('should fail without authentication', async () => {
            const productData = {
                name: 'Test iPhone',
                category: 'Smartphone',
                price: 599.99,
                condition: 'Good'
            };

            const response = await request(app)
                .post('/api/products')
                .send(productData);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/products', () => {
        it('should get all products', async () => {
            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.products).toBeDefined();
            expect(Array.isArray(response.body.products)).toBe(true);
        });

        it('should filter products by category', async () => {
            const response = await request(app)
                .get('/api/products?category=Smartphone');

            expect(response.status).toBe(200);
            expect(response.body.products).toBeDefined();
        });
    });
});