import { describe } from "node:test";
import request from "supertest";
import {DataSource} from "typeorm"; // DataSource type hai wo hum ko connection variable k liye chaiye tha
import {AppDataSource} from "../../src/config/data-source";
import app from "../../src/app";
  
describe("POST /auth/login", ()=>{ // POST request, aur dekho /auth/login krdia endpoint
      // Variables 
      let connection: DataSource; // connection is variable and uss kaa type DataSource hai
      // Jest provide some hooks, so now we are connecting to db
      // so beforeAll hook use kra and db sye connection establish kra 
      beforeAll(async () => {
          connection = await AppDataSource.initialize();
      }); 
      // beforeEach hook hai ab har test k liye alag alag db entry ho, aesa naa ho Test1 ki chezain Test2 mein hoon and so on. Warna db mein conflict aajaye gaa 
      beforeEach(async () => {
          //Database truncate 
          // create backend - tests - utils - index.ts: (iss mein utility function banaein gye)
          //await truncateTables(connection); // truncate means table k ander values delete kr rehye hain
          await connection.dropDatabase(); // db delete kra 
          await connection.synchronize(); // delete kr k wapis sye synchronize krdia
      })
      // afterAll hook to close db connection 
      afterAll(async () => {
          await connection.destroy();
      })
 
      // Happy path/fields - jo test pass hongye 
      describe("Given all fields", ()=> {
          // Test 1 - status 201 expectation 
          it.todo("should login the user");
      
          // Test 2
          // Test 3 
          // Assignment 
      });
});