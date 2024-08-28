import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import { body } from 'express-validator';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import loginValidator from '../validators/login-validator';
import { CredentialService } from '../services/CredentialService';
import authenticate from '../middlewares/authenticate';
import { AuthRequest } from '../types';
import validateRefreshToken from '../middlewares/validateRefreshToken';
import parseRefreshToken from '../middlewares/parseRefreshToken';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User); // ab userRepository pass krdia to UserService
const userService = new UserService(userRepository); // dependency injection - constructor k ander recevie krtye hai dependencies
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(userService, logger, tokenService, credentialService); // all services 

//router.post("/register", (req,res) => authController.register(req,res)); // controller ki help sye yhe code chota hogaya so using (req,res) => authController.register(req,res)
//router.post("/register", (req,res,next) => authController.register(req,res,next));
// router.post("/register", [body("email").notEmpty().withMessage("Email is required!")], (req: Request, res:Response, next:NextFunction) => authController.register(req, res, next));

// registerValidator, so our all validations are in src - validators - register-validator.ts
router.post('/register', registerValidator, (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
); // controller ki help sye yhe code chota hogaya so using (req,res) => authController.register(req,res)

// Login route 
// loginValidator and login method implement ab krna paryegaa. Tu login method hum controller mein krein gye implement. 
router.post("/login", loginValidator, (req: Request, res:Response, next:NextFunction) => authController.login(req, res, next));

// User route
// now this route is protected route kyn? we used authenticate aur iss mein token hona hi chaiye nhi howa tu 401 error aur middleware sye hi user ko return krdein gye yaa user ko kick krdia jayegaa
router.get("/self", authenticate, (req: Request, res: Response)=>authController.self(req as AuthRequest,res),); // self func ab banan paryegaa

// Refresh endpoint 
router.post("/refresh", validateRefreshToken, (req:Request, res:Response, next:NextFunction)=>authController.refresh(req as AuthRequest,res, next),);

// Logout User - authenticate means jo user logged in hai sirf wohi logout krsakta hai aur parseRefreshToken lazmi kyn k hum refresh token bhi dena hai aur logout k liye iss ko delete krdein gye
router.post("/logout", authenticate, parseRefreshToken, (req:Request, res:Response, next:NextFunction)=>authController.logout(req as AuthRequest,res, next),);

export default router;
