import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class TenantController {
    constructor(private tenantService: TenantService, private logger: Logger,){}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const {name, address} = req.body; 

        this.logger.debug("Request for creating a tenant", {name, address}); // for debugging in application 

        this.logger.debug("Request for creating a tenant", req.body); 
        
        try {
            // db query krni hai, lekin uss k liye tu service chaiye hogi tu service create krtye hain 
            const tenant = await this.tenantService.create({name, address});
            this.logger.info("Tenant has been created", {id:tenant.id});
            
            res.status(201).json({id: tenant.id});
        } catch(err) {
            next(err);
        }
    }



}