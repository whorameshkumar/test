import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity({name:'refreshTokens'}) // Decorator 
export class RefreshToken {
    // so 5 columns banaye id, expiresAt, user, updatedAt, createdAt
    // means jb bhi User naa kaa table banye gaa uss mein id naam kaa column ban jaye gaa in db and @PrimaryGeneratedColumn() means unique hoga wo and auto increment hoga
    @PrimaryGeneratedColumn()
    // Hum ko pora refresh token store krnye ki need nhi hai in db. Hum refresh token kaa db mein record create krein gye. Phir uss record ki id ko hum embed krein gye in refresh token. Ab koi hacker uss id sye khelta hai tu pata chal jaye gaaa.
    // jb hum request krein gye tu uss request mein refresh token aayegaa tu uss token mein hum id lein gye, phir db mein check krein gye k uss id sye koi record db mein hai. Agar record hai tu kisi hacker n revoke nhi kia hai aur agar token nhi hai tu means kisi n revoke/nikala hai token ko. Phir uss ko aagye hum allow nhi krein gye.
    id: number;
    @Column({ type: 'timestamp' }) // token kaa expire data store kr rehye hain iss column mein k kb token expire howa yaa hoga
    expiresAt: Date; // expires_at yhe snake style hai, hum camel case use krein gye expiresAt
    // user and refresh ko apas mein connect kr rehye hain. Iss dono kaa relation kya bana satkye hain? Ref: typeorm.io/relations  - one to one, one to many, many to many,etc.
    // One-to-One relation i.e. one record iss table kaa aur one record uss table ka e.g. aik user kaa sirf aik hi password hosakta hai.
    // usually in relational db, we have relations like one-to-many, one-to-one etc tu yhe based hotye hain on foreign-key and primary-key. So, we should use foreign-key and primary-key aur iss sye data integrity barti hai. Agar user mein hum forigen-key nhi use krtye tu db mein invalid user bhi aajaye gaa aur yhe barye maslye krye gaa. Better use forign-keys.
    // typeorm.io/many-to-one-one-to-many-relations
    // User entity ki persective sye dekho tu user kisi bhi device sye login krye gaa tu mulitple tokens hongye. Aur Refresh token Entity sye dekho tu refresh token aik hi hoga bhanye wo kisi bhi device sye login krye. Tu humarye case mein One to many and vice-versa relationship hoga.
    @ManyToOne(() => User) // ManytoOne or OnetoMany -> e.g aik user multiple devices sye login krsakta hai so OnetoMany. Similarly, aik refresh token sirf aik user kaa hi hoga so ManytoOne relationship howa aur many means many refresh token but aik refresh token for only one user.
    user: User; // user.id typeorm khud hi bana dye gaa        // forign key is userId
    // lekin jesye user delete howa tu hum chatye hain uss k sarye tokens bhi delete hojaein tu wo hum User entity mein cascade k through krein gye abhi nhi kr rehye.
    // update and create info
    @UpdateDateColumn()
    updatedAt: number;
    @CreateDateColumn()
    createdAt: number;
}
