import { describe } from "node:test";
import request from 'supertest'; // for API endpoints 
import app from '../../src/app';
import {User} from "../../src/entity/User"; // dekho entity folder hai in src uss kaa User lye lia 
import {DataSource} from "typeorm"; // DataSource type hai wo hum ko connection variable k liye chaiye tha
import {AppDataSource} from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import createJWKSMock from 'mock-jwks';
// import { isJwT, truncateTables } from "../utils";
// import { cookie } from "express-validator";
// import { RefreshToken } from "../../src/entity/RefreshToken";

// describe is used to write tests 
describe("GET /auth/self", ()=>{ // self is who am i, whoami bhi use krsaktye thy hum instead of self
    
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
        
        // Test 1 - status 200 expectation 
        it("should return the 200 status code", async () => {
            const accessToken = jwks.token({ // token ki need hai tu we are adding token generation logic
                sub: "1", // id 1 
                role: Roles.CUSTOMER, // role Customer daal dia
            })
            const response = await request(app).get("/auth/self").set("Cookie",[`accessToken=${accessToken}`]).send(); // get request hai tu send kuch nhi krein gye 
            expect(response.statusCode).toBe(200);
        });

        // Test 2 
        it("should return the user data", async () => {
            
            // Register user - jb user register kr raha hai tu /auth/self iss k ander hum ko token send krna hai. Agar hum browser mein hotye tu wo automatic cookie send krta hai
            const userData = { // dummy data
                firstName: "Ramesh",
                lastName: "Kumar",
                email: "r@gmail.com",
                password: "secret",
            }
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({...userData, role:Roles.CUSTOMER});  // userData jo dummy user data hai wo dala + role bhi pass krdia 
            
            // aik option hum manually token send krein kyn k iss k liye hum ko server ko bhi run krna paryegaa kyn k public key ko server p host bhi krna paryegaa
            
            // better use mock server for tokens jo k humarye liye tokens bhi generate kryegaa for testing + humarye liye JWKs public keys bhi generate kryegaa

            // Generate Accesstoken 
            const accessToken = jwks.token({sub: String(data.id), role: data.role}); // will get user id + role from data, tu yhe accessToken hai 

            // Add accessToken to cookie 
            // db mein req krein gye tu user already register hona chaiye
            // Yaa phir jb user register kr raha hai tu jo token hum ko return horaha hai uss ko hum ko get("/auth/self") send krna paryegaa. Agar frontend p hotye tu browser automatically cookies send krta. Yhe test hai tu hum ko manually cookie add krni paryegii
            const response = await request(app).get("/auth/self").set("Cookie",[`accessToken=${accessToken};`]).send();
            
            // Assert - wo user id hai yaa nhi jo hum n register user mein rakhi thi
            // Check if user id matches with registered user 
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });   
        
        // Test 3
        it("should not return the password field", async () => {
            // Register user - jb user register kr raha hai tu /auth/self iss k ander hum ko token send krna hai. Agar hum browser mein hotye tu wo automatic cookie send krta hai
            const userData = { // dummy data
                firstName: "Ramesh",
                lastName: "Kumar",
                email: "r@gmail.com",
                password: "secret",
            }
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({...userData, role:Roles.CUSTOMER});  // user data mila lekin hum ko user ki id chaiye iss mein
            // aik option hum manually token send krein kyn k iss k liye hum ko server ko bhi run krna paryegaa kyn k public key ko server p host bhi krna paryegaa
            // better use mock server for tokens jo k humarye liye tokens bhi generate kryegaa for testing + humarye liye JWKs public keys bhi generate kryegaa
            // Generate token 
            const accessToken = jwks.token({sub: String(data.id), role: data.role}); // will get user id from data 
            // Add token to cookie 
            const response = await request(app).get("/auth/self").set("Cookie",[`accessToken=${accessToken};`]).send();
            console.log("User data -----------", response.body); // tum dekho gye password bhi user kaa return horaha hai we need to disable it 
            // Assert - wo user id hai yaa nhi jo hum n register user mein rakhi thi
            // Check if user id matches with registered user 
            expect((response.body as Record<string, string>)).not.toHaveProperty("password",); // hum nhi chatye password property ho in user 
        });


        // Test 4
        it("should return 401 status code if token does not exists", async () => {
            // Register user - jb user register kr raha hai tu /auth/self iss k ander hum ko token send krna hai. Agar hum browser mein hotye tu wo automatic cookie send krta hai
            const userData = { // dummy data
                firstName: "Ramesh",
                lastName: "Kumar",
                email: "r@gmail.com",
                password: "secret",
            }
            const userRepository = connection.getRepository(User);
            await userRepository.save({...userData, role:Roles.CUSTOMER});  // user data mila lekin hum ko user ki id chaiye iss mein
            // aik option hum manually token send krein kyn k iss k liye hum ko server ko bhi run krna paryegaa kyn k public key ko server p host bhi krna paryegaa
            // better use mock server for tokens jo k humarye liye tokens bhi generate kryegaa for testing + humarye liye JWKs public keys bhi generate kryegaa
            // Add token to cookie 
            const response = await request(app).get("/auth/self").send();
            console.log("User data -----------", response.body); // tum dekho gye password bhi user kaa return horaha hai we need to disable it 
            // Assert 
            expect(response.statusCode).toBe(401);
        });


        

    });
});