import 'reflect-metadata';
import { DataSource } from 'typeorm';
//import { User } from '../entity/User';
import { Config } from '.';
//import { RefreshToken } from '../entity/RefreshToken';
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // Don't use this is production make it false b/c database run kiye bagyer wo entity and models ko db k saath sync krdeta hai
    // synchronize: true,
    // ab mene logic likh di hai prod k liye hamesha false flag rehye gaa so no tension
    //synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev" || Config.NODE_ENV === "sim",
    synchronize: false,
    logging: true, // db logging false no logs and true will record logs
    //entities: [User, RefreshToken, Tenant],

    // entities: ["src/entity/*.ts"], // bar bar likhna par raha tha jb bhi new entity bana rehye thy ab hum n bol dia src/entity k ander humari entities hain wo sb entities consider krlu called wild-card 
    // migrations: ["src/migration/*.ts"],

    entities:["src/entity/*.{ts,js}"], // so hum bol rehye hain k entity i,e, User, Tenant and RefreshToken typeScript bhi hosakti hai + JavaScript bhi hosakti hai 
    migrations:["src/migration/*.{ts,js}"],// so hum bol rehye hain k migrations typeScript bhi hosakti hai + JavaScript bhi hosakti hai 
    subscribers: [],
});

