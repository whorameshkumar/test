import { describe } from "node:test";
import request from 'supertest'; // for API endpoints 
import app from '../../src/app';
import {DataSource} from "typeorm"; // DataSource type hai wo hum ko connection variable k liye chaiye tha
import {AppDataSource} from "../../src/config/data-source";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

// describe is used to write tests 
describe("POST /tenants", ()=>{ // POST request 
    // Variables 
    let connection: DataSource; // connection is variable and uss kaa type DataSource hai

    let jwks: ReturnType<typeof createJWKSMock>;  // look mock service use kra humein token chaiye tha 
    
    let adminToken: string; // access token hoga 
    
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5000");
    }); 
    
    beforeEach(async () => {
        //Database truncate 
        // create backend - tests - utils - index.ts: (iss mein utility function banaein gye)
        //await truncateTables(connection); // truncate means table k ander values delete kr rehye hain
        await connection.dropDatabase(); // db delete kra 
        await connection.synchronize(); // delete kr k wapis sye synchronize krdia
        jwks.start();
        // token 
        adminToken = jwks.token({
            sub:"1",
            role:Roles.ADMIN, // hum chatye hain only admin user tenant ko create kr paye bs aur koi user naa create kr sakye tenant, tu iss k liye tests baad mein likhein gye. 
        })
    })
    
    // to stop server
    afterAll(async ()=>{
        await connection.destroy();
    })
    
    afterEach(() => {
        jwks.stop();
    })


    // Happy path/fields - jo test pass hongye 
    describe("Given all fields", () => {
        
        /* // Test 1 - status 201 expectation 
        it("should return a 201 status code", async () => {
            const tenantData = { // mock data
                name: "Tenant name",
                address: "Tenant address",
            };
            const response = await request(app).post("/tenants").send(tenantData);
            console.log('************************************', response)
            expect(response.statusCode).toBe(201);    
        });

        // Test 2     
        it("should create a tenant in the database", async () => {
            const tenantData = { // mock data
                name: "Tenant name",
                address: "Tenant address",
            };
            await request(app).post("/tenants").send(tenantData);
            // db sye data uthana hai for Tenant entity 
            const tenantRepository = connection.getRepository(Tenant); // look Tenant entity hi pass krdi
            const tenants = await tenantRepository.find(); // find returns an array
            expect(tenants).toHaveLength(1); // aik tenant kaa record hona chaiye in db
            expect(tenants[0].name).toBe(tenantData.name); // tenant ka naam from mock data 
            expect(tenants[0].address).toBe(tenantData.address); // tenant ka address from mock data 
        } )
        */


        // Test 1 - status 201 expectation 
        it("should return a 201 status code", async () => {
            const tenantData = { // mock data
                name: "Tenant name",
                address: "Tenant address",
            };
            const response = await request(app).post("/tenants").set('Cookie',[`accessToken=${adminToken}`]).send(tenantData); // dekho ab cookie add krdi access token hai wo
            //console.log('************************************', response)
            expect(response.statusCode).toBe(201);    
        });
    
        // Test 2 
        it("should create a tenant in the database", async () => {
            const tenantData = { // mock data
                name: "Tenant name",
                address: "Tenant address",
            };
            await request(app).post("/tenants").set('Cookie',[`accessToken=${adminToken}`]).send(tenantData);
            const tenantRepository = connection.getRepository(Tenant); // look Tenant entity hi pass krdi
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(1); // aik tenant kaa record hona chaiye in db
            expect(tenants[0].name).toBe(tenantData.name); // tenant ka naam from mock data 
            expect(tenants[0].address).toBe(tenantData.address); // tenant ka address from mock data 
        })


        // Test 3
        // agar user logged in hi nhi hai tu wo tu tenant nhi create krsakye - only authenticated user hi create kr sakye 
        // abhi hum n test3 mein koi token nhi bheja, means user logged in nhi hai tu wo tanent nhi create krsakta
        it("should return 401 if user is not authenticated ", async () => {
            const tenantData = { // mock data
                name: "Tenant name",
                address: "Tenant address",
            };
            const response = await request(app).post("/tenants").send(tenantData); // look hum n iss request mein koi token nhi bheja tu user authenticated nhi hona chaiye, 401 aana chaiye 
            expect(response.statusCode).toBe(401);
            const tenantRepository = connection.getRepository(Tenant); // look Tenant entity hi pass krdi
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0); // checking by mistake koi data tu create nhi horaha naa in db 
        })


        // Test 4
        // agar user k pass invalid yaa token hota hi nhi hai tu hum 401 return krtye hain
        // agar token hai but wo role nhi hai uss case mein hum boltye hain yhe authorization kaa problem hai aur uss k liye 403 status code hota hai
        it("should return 403 if user is not an admin", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER, // hum n bol dia manager tenant create krye gaa of cousrse Manager tu nhi krsakta only admin can do
            })
            const tenantData = { // mock data
                name: "Tenant name",
                address: "Tenant address",
            };
            const response = await request(app).post("/tenants").set("Cookie", [`accessToken=${managerToken}`]).send(tenantData); // look hum n iss request mein koi token nhi bheja tu user authenticated nhi hona chaiye, 401 aana chaiye 
            expect(response.statusCode).toBe(403);
            const tenantRepository = connection.getRepository(Tenant); // look Tenant entity hi pass krdi
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0); // checking by mistake koi data tu create nhi horaha naa in db 
        })

    });
});