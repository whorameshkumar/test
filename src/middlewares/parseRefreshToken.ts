import {expressjwt} from "express-jwt";
import { Config } from "../config";
import {Request} from "express";
import { AuthCookie } from "../types";
// bs kesye hum get/parse krna hai
export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!, // tu refresh token ko hum n sign kra hai using single key tu uss ko verify krnye k liye bhi sinlge key use krein gye jo .env mein hai
    algorithms: ['HS256'],
    getToken(req: Request) { // ab req.cookies hai uss mein hum token ko return krwanye walye hain. By default library authorization header hota hai uss k ander access token ko dhondti hai. Aur yhe refresh token hai abhi in our case.  
        const {refreshToken} = req.cookies as AuthCookie; // refreshToken ko search kr rehye hain in req.cookies
        return refreshToken; 
    },
})