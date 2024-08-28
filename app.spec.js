"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const utils_1 = require("./src/utils");
const app_1 = __importDefault(require("./src/app"));
const supertest_1 = __importDefault(require("supertest"));
// describe("Ramesh", ()=> { // Ramesh naa kaa test
//     it("should work", () => {}); // it should work ;)
// });
(0, node_test_1.describe)('Ramesh', () => {
    // Ramesh naa kaa test
    // unit testing
    it('should calculate the discount', () => {
        const result = (0, utils_1.calculateDiscount)(100, 10); // price 100 hai aur discount 10
        expect(result).toBe(10); // tu result 10 ana chaiye - to test pass hoga
    });
    // API testing
    it('should return 201 status', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get('/').send(); // yhe app is app.ts where we have application routes
        expect(response.statusCode).toBe(201);
    }));
});
