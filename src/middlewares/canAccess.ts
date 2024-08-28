import { NextFunction, Request, Response } from "express"
import { AuthRequest } from "../types";
//import {Roles} from "../constants";
import createHttpError from "http-errors";

export const canAccess = (roles: string[]) => { // dekho in 🔵src - routes - tenant.ts hum n array mein [Roles.ADMIN] pass kra tu uss ko receive yahan kr rehye hain using roles of array. Hum aur bhi roles pass krsaktye hain jesye Configurator bhi create kr sakye tu [Roles.ADMIN, Roles.Configurator] krdetye 
    return(req:Request, res:Response, next:NextFunction) => { // middleware mein yhe 3 miltye hain
        const _req = req as AuthRequest; 
        const roleFromToken = _req.auth.role; // token k ander sye role ko get krna hai

        if(!roles.includes(roleFromToken)) { // agar roles k ander token nhi hai tu no permissions
            const error = createHttpError(403, "You don't have enough permissions",);
            next(error);
            return;
        }

        next();
    };
}