import { NextFunction, Response } from 'express';
import { AuthRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';
import { Roles } from '../constants';
 
export class AuthController {

    
    // injecting services 
    constructor(private userService: UserService, private logger:Logger, private tokenService: TokenService, private credentialService: CredentialService) {} // aesye bhi constructor bana saktye ho // 2nd way of constructor, faida no need of instance

    
    // For creating/registering user 
    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;

        // for email
        // after seggregating validation logic separately
        const result = validationResult(req);
        if (!result.isEmpty()) {
            // result.isEmpty() -> agar empty hai tu all good, empty nhi hai tu means errors hain // !result.isEmpty() -> agar empty nhi hai tu all good
            return res.status(400).json({ errors: result.array() });
        }

        // for logging
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '******************',
        }); // kbhi password dalo for compliance issues

        try {
            const user = await this.userService.create({ firstName, lastName, email, password, role: Roles.CUSTOMER}); //constructor mein userService recieve kri ab phir jaa k userSerivce create kri
            // logging - mene abhi id:user.id kaa test nhi likha tu log mein kuch nhi jayegaa
            this.logger.info('User has been registered', { id: user.id }); // user ki id kaa log

            const payload: JwtPayload = {
                // Payload object jis mein user ki id and role dala
                sub: String(user.id), // User ki id, id number tha tu convert kra to string
                role: user.role, // user kaa role
            };
            // token ko sign krnye k liye private key use kri to sign token

            // Access token generate krdia
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token - means phir refresh token kaa aik record bana dia
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            // Refresh token ko generate krdia + token id embed krdi
            const refreshToken = this.tokenService.generateRefreshToken({ ...payload, id: String(newRefreshToken.id) });

            // lastly accessToken and refreshToken ko cookie mein daal dia hai
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict', // jo host url hai uss ko send hoga for safety
                maxAge: 1000 * 60 * 60, // for 1 hour cookie will be valid then expired
                httpOnly: true, // very important
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict', // jo host url hai uss ko send hoga for safety
                maxAge: 1000 * 60 * 60 * 24 * 365, // usually refresh cookie ki validity zada hoti hai then access token. So, hum n 1 year ki krdi abhi.
                httpOnly: true, // very important
            });

            res.status(201).json({ id: user.id }); // Test Assignement to return user id
            //res.status(201).json(); //agar test nhi likha tu yhe line chalao
        } catch (err) {
            next(err);
            return;
        }
    }


    // For Login
    async login(req: RegisterUserRequest, res: Response, next:NextFunction) { // ab Request and Response type batai hain. Lekin iss Request and Response ko hum apnye end sye modify/extend kr saktye hain using interface. // next dia for error handling

        // Validation logic for login - refer: 🔵src - validators - login-validator.ts
        const result = validationResult(req); 
        // agar validation mein koi error hai tu uss error ko hum n return krdia yahan
        if (!result.isEmpty()){ // result.isEmpty() -> agar empty hai tu all good, empty nhi hai tu means errors hain // !result.isEmpty() -> agar empty nhi hai tu all good
            return res.status(400).json({errors:result.array()}); // errors app.ts sye aaraha hai jahan error format ki logic defined hai
        }
        
        // For login we need/get only email and password from response body
        const {email, password} = req.body; 

        // for logging
        this.logger.debug("New request to login a user", {email, password:"********"}); // dummy password

        try{    
            /* Steps for login logic: 
            Check if username (email) exists in database
            Compared password 
            Generate tokens
            Add token to cookies 
            Return the response (id)*/

            // getting user from db
            const user = await this.userService.findByEmail(email); //constructor mein userService recieve kri ab phir jaa k userSerivce create kri
            
            // Login Logic for email - check if user email does not exists in database
            if(!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match.",  // hum tu email check kr rehye hain tu password kyn likha bs hacker ko confuse krnye k liye ;)
                ); 
                next(error); // next kr k error send kra 
                return; // then return krdia means ab aagye nhi bahr saktye executions yahan stop hogai
            }

            // Login Logic for password - Compared password 🔵src - services - CredentialService.ts
            // credentialService ko iss file k constructor mein bhi dala aur 🔵src - routes - auth.ts
            // password -> const {email, password} = req.body; // aur yhe user request mein dalye gaa for login 
            // user.password -> const user = await this.userService.findByEmail(email); // db mein jo user kaa password hai wo user.password k through milyegaa
            const passwordMatch = await this.credentialService.comparePassword(password, user.password,); // raw pass from user, hash pass from db
            // if password is not matching then generate this error 
            if (!passwordMatch) {
                const error = createHttpError(400, "Email or password does not match",);
                next(error);
                return; // agar koi problem hai tu code aagye naa jaye 
            }

            // Payload
            // agar email and password sb match hai tu token create kr saktye hain
            const payload: JwtPayload = { // Payload 
                sub: String(user.id), // User ki id 
                role: user.role, // user kaa role
            };
            
            // Generating Access Token
            // const accessToken = sign(payload, privateKey, {algorithm:'RS256', expiresIn:"1h", issuer:'backend',}); // sign krnye k liye payload (user id and role), private key, RS256 algo dia 
            const accessToken = this.tokenService.generateAccessToken(payload); 

            // Refresh token - Persist/store kra in db user pass kr k 
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            // Generating new Refresh token
            const refreshToken = this.tokenService.generateRefreshToken({...payload, id: String(newRefreshToken.id)}); 
            
            // Cookies mein accessToken and refreshToken ko daal dia
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict', // jo host url hai uss ko send hoga for safety 
                maxAge: 1000 * 60 * 60, // for 1 hour cookie will be valid then expired 
                httpOnly: true, // very important
            })

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict', // jo host url hai uss ko send hoga for safety 
                maxAge: 1000 * 60 * 60 * 24 * 365, // usually refresh cookie ki validity zada hoti hai then access token. So, hum n 1 year ki krdi abhi. 
                httpOnly: true, // very important
            })

            // for logging 
            this.logger.info("User has been logged in", {id: user.id});

            //res.status(201).json({id:user.id}); // 201 jb resource create krtye hain
            res.json({id:user.id}); // 200 login k liye hona chaiye aur by default res.json 200 deta hai
            //res.json({id:user.id});           // by default 200 status code jayegaa
        }
        catch (err) {
            next(err);
            return;
        }         
    }    


    // self method 
    async self(req: AuthRequest, res: Response) {
        console.log(req.auth);
        // token req.auth.id -> ab yahan jo token p user ki id hai wo hum ko req.auth.id p mil jaye. Phir db p call krein gye uss user ko by id call krein gye. 
        // so we need to add middle ware on req.auth.id aur phir yhe cookie p token extract kryegaa uss ko verify krye gaa phir auth.id ko request body p add kryegaa
        const user = await this.userService.findById(Number(req.auth.sub));
        // res.json(user); // default status 200 return krye gaa tu test pass hojaye gii  // BIG PROBLEM YR YAHAN HUM PURA USER HI RETURN KR REHYE HAIN TU PASSWORD BHI TU HOGA
        res.json({...user, password:undefined}); // look mene password yahan undefined kr dia, means password user mein nhi jaye gaa
    }


    // refresh method 
    async refresh(req:AuthRequest, res:Response, next: NextFunction) {
        try{
            console.log("Token coming from controller: ", (req as AuthRequest).auth); 
            // abhi tk hum n check kra k refresh token db mein hai yaa nhi hai aur middleware mein sign bhi verify krnye kaa kaam krdia hai
            // agar yahan tk request phuch jati hai means refresh token valid hai and we will generate new access token 
            // hum n refresh token ki safety krli agar wo kisi k haath lagta hai wo invalid hojayegaa but what if access token hath lag gaya tu? token rotation will help here jesye new refresh token generate kr rehye ho tu saath hi new access token bhi generate hojaye and purana access token delete hojaye 
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role, 
            };

            // Jesye hum access token generate kr rehye hain uss time refresh token bhi generate kr rehye hain, means more secure less window hogi for breaches

            // Generate access token - less validity 
            const accessToken = this.tokenService.generateAccessToken(payload); //this.tokenService constructor issi file mien dependency-injection

            // user chaiye to pass to persistRefreshToken for refresh token 
            const user = await this.userService.findById(Number(req.auth.sub));  
            // yhe extra logic likhi hum n basically query hi hai 
            if (!user) {
                const error = createHttpError(
                    400, // user db mein nhi, but token mein hai, client issue 
                    "User with the token could not find",
                );
                next(error);
                return;
            }

            // Persist the refresh token, ab persistRefreshToken mein user bhetye hain iss liye upar user ko find kra
            // Phelye hum db mein record create kr rehye hain user kaa 
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            // new refresh token ko generate krnye sye phelye old wala refresh token delete bhi tu krna hoga - for rotation -> jb access token refresh kr rehye hain tb refresh token ko bhi refresh krdein gye aur user ko new refresh token send krdein gye aur db mein bhi update krdein gye
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            // Finally now generating new refresh token
            const refreshToken = this.tokenService.generateRefreshToken({...payload, id: String(newRefreshToken.id)}); 
            
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict', // jo host url hai uss ko send hoga for safety 
                maxAge: 1000 * 60 * 60, // for 1 hour cookie will be valid then expired 
                httpOnly: true, // very important
            })            
            
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict', // jo host url hai uss ko send hoga for safety 
                maxAge: 1000 * 60 * 60 * 24 * 365, // usually refresh cookie ki validity zada hoti hai then access token. So, hum n 1 year ki krdi abhi. 
                httpOnly: true, // very important
            })
            this.logger.info("User has been logged in", {id: user.id});
            res.json({id:user.id}); 
        } catch (err) {
            next(err);
            return;
        }
    }






    // logout user
    async logout(req: AuthRequest, res:Response, next:NextFunction){
        //console.log(req.auth); 
        try{
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted",{id:req.auth.id,});
            this.logger.info("User has been logged out",{id:req.auth.sub,});
            // cookies ko clear kr rehey hain 
            res.clearCookie('accessToken');
            res.clearCookie('refreshtoken');
            res.json({});
        } catch(err){
            next(err);
            return;
        }
    }


    
}
 