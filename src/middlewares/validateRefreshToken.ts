import {expressjwt} from "express-jwt";
import { Config } from "../config";
import {Request} from "express";
import { AuthCookie, IRefreshTokenPayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";
export default expressjwt({

    secret: Config.REFRESH_TOKEN_SECRET!, // tu refresh token ko hum n sign kra hai using single key tu uss ko verify krnye k liye bhi sinlge key use krein gye jo .env mein hai
    
    algorithms: ['HS256'], // refresh token we used different algo that is HS256 jo k single key sye sign kra hai
    
    getToken(req: Request) { // ab req.cookies hai uss mein hum token ko return krwanye walye hain. By default library authorization header hota hai uss k ander access token ko dhondti hai. Aur yhe refresh token hai abhi in our case.  
        const {refreshToken} = req.cookies as AuthCookie; // refreshToken ko search kr rehye hain in req.cookies
        return refreshToken; 
    },

    // now checking refreh token db mein hai k nhi hai. Dekho jb user logout hota hai means refresh token nhi hai. Abhi tk hum n logout ki funcationality nhi dali. But we have method called isRevoked to check k refresh token still available hai k nhi hai.
    async isRevoked(request:Request, token){
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken); // getRepository sye refreshtoken nikala
            const refreshToken = await refreshTokenRepo.findOne({ 
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id), // db mein id hai jo AuthController mein defined hai for RefreshToken
                    user: {id: Number(token?.payload.sub)}, // RefreshToken.ts
                },
            });
            return refreshToken === null;
        } catch (err) {
            logger.error("Error while getting the refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true; 
    },
})