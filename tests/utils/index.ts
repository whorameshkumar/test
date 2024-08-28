import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/entity/Tenant';
export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas; // typeorm ki doc sye lia
    // looping over all entities - we have entity folder
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear(); // will truncate means db kaa table delete hojaye gaa
    }
};

// JWT token
export const isJwT = (token: string | null): boolean => {
    // token string bhi hosakta hai aur null bhi and null k case mein valid nhi hoga
    if (token === null) {
        // null ki case mein no JwT
        return false;
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
        // JWT 3 parts kaa hota hai agar 3 kaa nhi hai tu false return kro
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8'); //Buffer is a global object // base64 ko string utf-8 mein convert kra
        });
        return true; // valid JWT hai tu return true
    } catch (err) {
        return false; // not valid JWT
    }
};


export const createTenant = async (repository: Repository<Tenant>)=> {
    const tenant = await repository.save({
        name: "Test tenant",
        address: "Test address",
    });
    return tenant;
}