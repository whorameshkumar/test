//import fs from 'fs';
//import path from 'path';
import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { Config } from '../config';
//import { ITenant } from '../types';
//import { AppDataSource } from '../data-source';      

export class TokenService {
    // constructor
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: string; // we want to read from .env rather than Buffer kr k file sye read krein
        
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, "SECRET_KEY is not set",);
            throw error; 
        }

        try {

            privateKey = Config.PRIVATE_KEY; // ! means iss mein private key aagai but iss k liye bhi check lagao

            //privateKey = Config.PRIVATE_KEY!; // ! means iss mein private key aagai but iss k liye bhi check lagao, so ! is not good practice 
            
            //privateKey = process.env.PRIVATE_KEY;
            
            //privateKey = fs.readFileSync(path.join(__dirname, '../../certs/private.pem')); // bs read kr rehye hain private key, so test pass ho, phelye dummy private key dye rehye thy
        } 
        // catch (err) {
        //     const error = createHttpError(500, 'Error while reading priavte key');
        //     //next(error); // next dena parta hai
        //     //return;
        //     throw error; // service mein next nhi use krsaktye aur abhi throw kra error and baad mein catch krdein gye
        // }
        catch {
            throw createHttpError(500, 'Error while reading private key');
        }

        const accessToken = sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h', issuer: 'backend' });
        return accessToken;
    }

    // Refresh Token
    generateRefreshToken(payload: JwtPayload) {
        console.log(payload);
        // Refresh Token
        // payload.id payload pass krna hai see AuthController.ts
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'restaurant',
            jwtid: String(payload.id),
        }); // look we used HS256 and expires in 1 year, but we can't use secretKey hard-coded // jwtid:String(newRefreshToken.id) yahan mene newRefreshToken pass kra
        return refreshToken;
    }

    // Persist Refresh Token
    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year) -> leap year function bana k logic likh saktye ho kyn k kisi years mein 366 days bhi hotye hain
        //const refreshTokenRepository = AppDataSource.getRepository(RefreshToken); //  RefreshToken lye lia aur refreshTokenRepository mein dala
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user, // upar isi controller mein hum n user define kra i.e. const user = await this.userService.create({firstName, lastName, email, password});
            expiresAt: new Date(Date.now() + MS_IN_YEAR), // Date.now() current date ab new Date kyn likha b/c expiresAt date type kaa hai see RefreshToken.ts
        });
        return newRefreshToken;
    }


    // for deleting the old refresh token
    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({id:tokenId});
    }

 
    
}
