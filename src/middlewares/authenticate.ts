// middlware aik normal function hoti hai aur iss function mein hum header yaa cookie ko access krtye hain. Aur json web token library ki help sye hum validate krtye hain phir request p user ki id add krtye hain. Aur yhe sb kaam krnye k liye library hoti hai `npm install express-jwt`. 
// so yhe code middleware return krye gaa aur iss ko hum directly route mein use kr saktye hain
import {expressjwt, GetVerificationKey} from "express-jwt";
import jwksClient from "jwks-rsa";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie } from "../types";

export default expressjwt({ // return middleware, so route mein jana paryegaa 
      
    secret: jwksClient.expressJwtSecret({// yhe secret to check humara access token i.e. RSA256 tu we need public key tu uss ko get krnye k liye we will use library i.e. `npm install --save jwks-rsa`
        jwksUri: Config.JWKS_URI!, // we will host public key on jwksUri and ! means paka iss mein aajayegaa
        cache: true, // har req uss service p jaa k fetch krye gaa nhi tu cache true kra
        rateLimit: true, // reqs ki limits set krna lazmi hai warna server pagal hojaye gaa
    }) as GetVerificationKey, // GetVerificationKey for typecasting 
      
    algorithms: ['RS256'],
      
    // token extract krnye kaa logic from header + cookies
    getToken(req: Request){ // dekho header mein bhi token bhejtye hain, lekin abhi humarye case mein hum cookies k through kr rehye hain tu getToken ko bol rehye hain cookie + header dono sye kaam chalna chaiye
        // from header
        const authHeader = req.headers.authorization; // authorization p bearer token hota hai
          
        // Bearer ejiuudsfdsfkjiornj -> token dummy 
        if (authHeader && authHeader.split(" ")[1] !== "undefined") { // authHeader.split(" ")[1] means Bearer ejiuudsfdsfkjiornj -> 'Bearer ' -> 'Bearer ' nhi consider hoga only token header mein jayegaa 
            const token = authHeader.split(" ")[1]; // agar token undefined nhi hai tu token return krdu
            if (token) {
                return token; // agar authHeader mein token nhi mila tu exection yahan ruk jayegii aur AuthCookie mein jayegii
            }
        }
          
        // from cookie 
        // `npm install cookie-parser`
        // type AuthCookie = {  // Agar token authHeader nhi mila tu AuthCookie sye dhoondh lo
        //     accessToken: string;
        // };

        const {accessToken} = req.cookies as AuthCookie ;
        return accessToken;
          
        // hum as AuthCookie and as GetVerificationKey iss liye likhtye hain k typescript type kaa error naa dye 
    }
})