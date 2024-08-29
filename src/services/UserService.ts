import { Repository } from 'typeorm';
//import { AppDataSource } from "../config/data-source";
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
//import { Roles } from '../constants';
//import bcrypt from 'bcrypt';
import bcrypt from "bcryptjs";

export class UserService {
    constructor(private userRepository: Repository<User>) {} // dosra way to write constructor for dependency injection

    async create({ firstName, lastName, email, password, role}: UserData) { // role daal dia 
        // email find kri aur status 400 dia bola email already exists
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, 'Email is already exists!');
            throw err;
        }

        // yahan p bhi coupling hai uss ko bhi de-couple krtye hain using dependency injection
        //const userRepository = AppDataSource.getRepository(User); // entity -> User.js so hum n User entity mein firstName, lastName, email, password store krye
        //return await this.userRepository.save({firstName, lastName, email, password});        // yahan this laga dia  // return object after the save in database
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); // npmjs.com/package/bcrypt - yr round 10 rakha hai iteration 10 hashes/sec hongye, e.g. round 31 will take 2-3 days/hash
        // yahan ab custom error msg likha apnye sye aur agar error aaya tu controller AuthController uss ko catch krye gaa aur error return krdye gaa
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role, // ab hard-coded nhi kra 
            }); // yahan this laga dia  // return object after the save in database
        } catch (err) {
            const error = createHttpError(500, 'Failed to store the data in the database',);
            console.error('Database error:', err);
            throw error;
        }
    }


    // getting user through email - like psql query
    // in AuthController we have "const user = await this.userService.findByEmail(email);"
    async findByEmail(email: string){
        const user = await this.userRepository.findOne({where: {email,},}); // email jo create howa hai wo find kro using findOne method 
        return user; 
    }


    // like psql query
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id, 
            }
        })
    }

    
}
