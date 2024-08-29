import request from 'supertest'; // for API endpoints
import app from '../../src/app';
import { User } from '../../src/entity/User'; // dekho entity folder hai in src uss kaa User lye lia
import { DataSource } from 'typeorm'; // DataSource type hai wo hum ko connection variable k liye chaiye tha
import { AppDataSource } from '../../src/config/data-source';
// import { truncateTables } from "../utils";
import { Roles } from '../../src/constants';
import { isJwT } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';
// describe is used to write tests
describe('POST /auth/register', () => {
    // POST request
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
        //await truncateTables(connection);
        await connection.dropDatabase();
        await connection.synchronize();
    });

    // afterAll hook to close db connection
    afterAll(async () => {
        await connection.destroy();
    });

    // Happy fields - jo test pass hongye
    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            // 3 AAA
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            // dummy data
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            const response = await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert (for checking e.g. status code) - expectation
            expect(response.statusCode).toBe(201); // mene bola mera expectation hai 201 status code aaye
        });

        // Test 2 - json format expectation
        test('should return valid json response', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            const response = await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert application/json utf-8 -> hum json testing kr rehye hain k response is in json
            expect((response.headers as Record<string, string>)['content-type']).toEqual(
                expect.stringContaining('json'),
            ); // mene bola mera expectation hai 201 status code aaye
        });

        // Test 3 - creating user id record in PostgreSQL
        it('should persist the user in the database or should return valid json response', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert
            const userRepository = connection.getRepository(User); // User is entity and entity src mein aik folder hai
            console.log('qqqqqqqq', userRepository);
            const users = await userRepository.find(); // db mein jitnye users hongye wo return hongye
            // aik user honga chaiye in db
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName); // checking userData mein firstName jo hai wo db store horaha hai k nhi, test pass means horaha hai
            expect(users[0].lastName).toBe(userData.lastName); // checking userData mein lastName jo hai wo db store horaha hai k nhi, test pass means horaha hai
            expect(users[0].email).toBe(userData.email); // checking userData mein email jo hai wo db store horaha hai k nhi, test pass means horaha hai
            // Password hum aesye nhi verify krtye - hum achye way sye test likhein gye for password in future
        });

        // Test 4

        // Test 5 - customer role test
        it('should assign a customer role', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert
            const userRepository = connection.getRepository(User); // User entity uthaya
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role'); // User entity mein role hai
            expect(users[0].role).toBe(Roles.CUSTOMER); // agar role hai tu wo customer kaa role hai? Yes, tu test pass but abhi tu role hi nhi hai
        });

        // Test 6 - yahan real password dia secrets but in db wo hashed hona chaiye
        it('should store the hashed password in the database', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert
            const userRepository = connection.getRepository(User); // userRepository iss liye kyn k hum ko db sye data fetch krna hai
            const users = await userRepository.find();
            console.log('Hashed password jo db mein hai', users[0].password); // u will see hased password jo db mein hai, so secret password hashed hogaya
            expect(users[0].password).not.toBe(userData.password); //not.toBe means k nhi hai, real password nhi hai same as db password
            expect(users[0].password).toHaveLength(60); // hashed password ki length 60 hoti hai, tu yhe test bhi pass hoga
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/); // hashed password ki yhe starting ki format hai tu haan tu test pass hoga // regular expression use kra 2b sye start hota hai, 2a sye bhi hotye hain lekin humara 2b sye horaha hai
        });

        // Test 7 - no duplicate email
        it('should return 400 status code if email is already exists', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User); // User is entity and repository db k liye chaiye hota hai
            await userRepository.save({ ...userData, role: Roles.CUSTOMER }); // ab dekho roles tu hum n backend mein use kra tha userData mein role nhi, tu hum ko role bhi dena para
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            const response = await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find(); // all users ko get kr rehye hain
            // Assert
            expect(response.statusCode).toBe(400); // expect 400 kr raha hai mil 201 raha tu code likhna paryegaa
            expect(users).toHaveLength(1); // length 1 honi chaiye, means dosra user create nhi hona chaiye, tu true hoga test aik hi user hai
        });

        // Test 8:
        // access token hum cookie mein kyn receive kr rehye hain? Kyn k inn ko hum response body mein receive kr saktye hain. Phir frontend iss ko local storage mein save krta hai. Problem yhe hai k koi bhi JS ki script iss local storage ko access krsakti hai. Tu less secure hojata hai. Iss liye hum tokens ko cookies k ander store krein gye. Specially HTTP-only cookie mein, tu js code uss ko access nhi krsakta bs server access krsakta hai.
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act
            const response = await request(app) // app.ts mein app export kra  // response k ander headers hain unn ko test kr rehye hain
                .post('/auth/register')
                .send(userData);
            // Assert
            // cookie kesye hota hai set? Tu special type kaa header hota hai set-cookie, tu server set-cookie naa kaam kaa header and cookie-content send krta hai. Jb frontend ussye dekhta hai tu cookie create krta hai.
            interface Headers {
                ['set-cookie']: string[];
            } // string array kra type
            // inteface use krnye sye phelye cookie kaa type any tha means type tha hi nhi, tu string krna parye gaa uss k liye as Headers kra then Headers interface code likha
            const cookies = (response.headers as unknown as Headers)['set-cookie'] || []; // headers p hum ko set-cookie ko find krna hai agar wo nhi hai tu empty array return krdye jb hum loop krein gye error naa aajaye
            // let accessToken:  String;
            // let refreshToken:  String;
            let accessToken = null; // assign krnye sye phelye hi maybe use kr rehye hain tu null krdia
            let refreshToken = null;
            cookies.forEach((cookie) => {
                // looping
                if (cookie.startsWith('accessToken=')) {
                    // accessToken= aesye start horaha hai tu means cookie hai
                    accessToken = cookie.split(';')[0].split('=')[1]; // accessToken=....phela...; ...dosra... ; ....teesra....; ...chotha...; tu ; hum n split kra [0] means 1st index wala tu yhe mila accessToken=...phela.... then = sye split kra and [1] means ....phela...
                }

                if (cookie.startsWith('refreshToken=')) {
                    // refreshToken= ie like accessToken
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull(); // null nhi hona chaiye token            // Pass
            expect(refreshToken).not.toBeNull(); // null nhi hona chaiye token            // Pass
            expect(isJwT(accessToken)).toBeTruthy(); // abhi tu dummy token k saath kra, but in actual we expect correct JWT token.             // Fail b/c valid token nhi dala
            expect(isJwT(refreshToken)).toBeTruthy(); // abhi tu dummy token k saath kra, but in actual we expect correct JWT token.             // Fail b/c valid token nhi dala
        });

        // Test 9 
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'r@gmail.com',
                password: 'secret',
            };
            // Act
            const response = await request(app) // app.ts mein app export kra  // response k ander headers hain unn ko test kr rehye hain
                .post('/auth/register')
                .send(userData);
            // Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken); // tu hum n RefreshToken Entity db mrin daal di
            const refreshTokens = await refreshTokenRepo.find(); // aur yhe array return krta hai aur uss p testing ki
            console.log('Refresh token: ', refreshTokens);
            expect(refreshTokens).toHaveLength(1); // aik refresh token ka test kr rehye hain
            // now checking k wo token ussi user kaa hai yaa nhi
            // hum n tu user:User kra in RefreshToken.ts but yahan userId kra kyn? b/c typeorm db mein user ko userId krdeta hai. Aur createQueryBuilder("refreshToken") iss mein refreshToken aik alias/as hai.
            console.log('User ID: ', (response.body as Record<string, string>).id);
            console.log('Refresh Token Repository: ', await refreshTokenRepo.find());
            // If still empty, try removing the where clause to see if any records exist
            const allTokens = await refreshTokenRepo.createQueryBuilder('refreshToken').getRawMany();
            console.log('All Tokens: ', allTokens);
            // Fail horaha hai yhe
            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId=:userId', {
                    // sounds like pgsql query
                    userId: (response.body as Record<string, string>).id, // Record<string,string> -> key, value typescript ki wajha sye type bataya
                })
                .getMany();
            console.log('Tokens: ', tokens);
            expect(tokens).toHaveLength(1); // user kaa h token hai naa
        });
    });

    // sad path/fields - jin test mein issues aasaktye hain
    describe('Fields are missing', () => {
        it('should return 400 status code', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: '', // look email nhi pass kr rehye hum
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            const response = await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(400); // abhi hum ko tu 201 dye raha hai hum expect kr rehye hain 400 but receive 201 horaha hai

            const userRepository = connection.getRepository(User); // user info nikali using repository
            const users = await userRepository.find();
            expect(users).toHaveLength(0); // means db mein koi record nhi jaa raha
        });
    });

    // for formatting - correct syntax is used
    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            // Arrange (input data, connection, in short jo data chaiye hota hai uss ko arrange krtye hain yahan)
            const userData = {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: ' r@gmail.com ', // look empty spaces diye hain hum n jan k
                password: 'secret',
            };
            // Act (mein kaam in test ko trigger krtye hain e.g. endpoint - using supertest library)
            await request(app) // app.ts mein app export kra
                .post('/auth/register')
                .send(userData);
            // Assert
            // db mein data ko get kra
            const userRepository = connection.getRepository(User); // user info nikali using repository
            const users = await userRepository.find();
            const user = users[0]; // means aesi wrong info p koi user nhi tu hai
            // hum expect kr rehey hain k user ki email "r@gmail.com" yhe ho but in db user ki email tu with space hai " r@gmail.com ", so to fix this we will trim it
            expect(user.email).toBe('r@gmail.com'); // error means db mein with space store horaha hai, need to fix it, so we can santize it means trim it.
        });
    });
});
