import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";
export class TenantService {

    // data store krna hai in db tu Repository use krna hoga aur Tenant entity pass krdi 
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create(tenantData: ITenant) { // dekho interace pass krdia  
        return await this.tenantRepository.save(tenantData);
    }
}