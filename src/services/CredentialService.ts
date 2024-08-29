import bcrypt from "bcryptjs"; // for password hashing

export class CredentialService {
    async comparePassword(userPassword: string, passwordHash: string) { // db sye userPassword and passwordHash lia, lazmi nhi passwordHash hi naa du kuch bhi dye saktye ho
        // compare returns boolean i.e. true and false 
        return await bcrypt.compare(userPassword, passwordHash); // ab unn ko hum compare kr rehye hai k userpassword same hai as passwordHash, tu test pass hojayegaa
    }
} 