import { describe } from 'node:test';
import { calculateDiscount } from './src/utils';
import app from './src/app';
import request from 'supertest';
// describe("Ramesh", ()=> { // Ramesh naa kaa test
//     it("should work", () => {}); // it should work ;)
// });
describe('Ramesh', () => {
    // Ramesh naa kaa test
    // unit testing
    it('should calculate the discount', () => {
        const result = calculateDiscount(100, 10); // price 100 hai aur discount 10
        expect(result).toBe(10); // tu result 10 ana chaiye - to test pass hoga
    });
    // API testing
    it('should return 201 status', async () => {
        const response = await request(app).get('/').send(); // yhe app is app.ts where we have application routes
        expect(response.statusCode).toBe(201);
    });
});
