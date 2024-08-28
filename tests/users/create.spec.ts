import { describe } from "node:test";
import request from 'supertest'; // for API endpoints 
import app from '../../src/app';
import {User} from "../../src/entity/User"; // dekho entity folder hai in src uss kaa User lye lia 
import {DataSource} from "typeorm"; // DataSource type hai wo hum ko connection variable k liye chaiye tha
import {AppDataSource} from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import createJWKSMock from 'mock-jwks'; 

// describe is used to write tests 
describe("POST /users", ()=>{ // self is who am i, whoami bhi use krsaktye thy hum instead of self
    // Variables 
    let connection: DataSource; // connection is variable and uss kaa type DataSource hai
    let jwks: ReturnType<typeof createJWKSMock>; // variable aur jwks kaa type ReturnType<typeof createJWKSMock> yhe hai aur yhe type hum n createJWKSMock sye nikala 
    
    // Jest provide some hooks, so now we are connecting to db
    
    // so beforeAll hook use kra and db sye connection establish kra 
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5000');  // yhe mock server p key ko host kreingye. Key yhe hai 'http://localhost:5000'  
        connection = await AppDataSource.initialize();
    });  
    
    // beforeEach hook hai ab har test k liye alag alag db entry ho, aesa naa ho Test1 ki chezain Test2 mein hoon and so on. Warna db mein conflict aajaye gaa 
    beforeEach(async () => {
        //Database truncate 
        // create backend - tests - utils - index.ts: (iss mein utility function banaein gye)
        //await truncateTables(connection); // truncate means table k ander values delete kr rehye hain
        jwks.start(); 
        await connection.dropDatabase(); // db delete kra 
        await connection.synchronize(); // delete kr k wapis sye synchronize krdia
    })
    
    // har aik test k baad mein iss ko stop bhi krna chata hn kyn k hum jwks.start(); ko start kra stop bhi tu krein gye naa tu hook use kra 
    afterEach(async ()=>{
        jwks.stop(); // for stop 
    })    
    
    // afterAll hook to close db connection 
    afterAll(async () => {
        await connection.destroy();
    })

    // Happy path/fields - jo test pass hongye 
    describe("Given all fields", ()=> {
        
        // Test 1
        it("should persist the user in the database", async () => {

            //const tenant = await createTenant(connection.getRepository(Tenant));

            // for token - dekho Admin role hai, so means jo token hoga wo Admin user kaa hoga abhi
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            })

            // Register user - jb user register kr raha hai tu /auth/self iss k ander hum ko token send krna hai. Agar hum browser mein hotye tu wo automatic cookie send krta hai
            const userData = { // dummy data
                firstName: "Ali",
                lastName: "Lal",
                email: "alitest1@gmail.com",
                password: "secrettest", 
                //tenantId: tenant.id, // kis admin sye iss ko connect krna hai
                tenantId: 1,
                role:Roles.MANAGER,
            }
            // Add token to cookie 
            await request(app).post("/users").set("Cookie", [`accessToken=${adminToken}`]).send(userData);
            // Assert 
            const userRepository = connection.getRepository(User); // checking db mein record create horaha hai
            console.log("Repositoryyyyyyyyyyy usersssssssssssssssssssss", userRepository);
            
            const users = await userRepository.find(); // sarye users yahan sye get krein gye
            console.log("usersssssssssssssssssssss", users);
            
            expect(users).toHaveLength(1); // we want 1 user create hojaye
            // expect(users[0].role).toBe(Roles.MANAGER); // Admin create kr payegaa sirf manager k roles ko wo test kr rehye hain
            expect(users[0].email).toBe(userData.email); 

        });
        
        // Test 2
        it("should create a manager user", async () => {
            // for token - dekho Admin role hai, so means jo token hoga wo Admin user kaa hoga abhi
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            })
            // Register user - jb user register kr raha hai tu /auth/self iss k ander hum ko token send krna hai. Agar hum browser mein hotye tu wo automatic cookie send krta hai
            const userData = { // dummy data
                firstName: "Ramesh",
                lastName: "Kumar",
                email: "r@gmail.com",
                password: "secr",
                tenantId: 1, // kis admin sye iss ko connect krna hai
            }
            // Add token to cookie 
            await request(app).post("/users").set("Cookie", [`accessToken=${adminToken}`]).send(userData);
            // Assert 
            const userRepository = connection.getRepository(User); // checking db mein record create horaha hai
            const users = await userRepository.find(); // sarye users yahan sye get krein gye
            //expect(users).toHaveLength(1); // we want 1 user create hojaye
            expect(users[0].role).toBe(Roles.MANAGER); // Admin create kr payegaa sirf manager k roles ko wo test kr rehye hain 
        });

        // Test 3
        it.todo("should return 403 if non-admin user tries to create a user");   

    });
});