import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from './Tenant';

@Entity({name:"users"}) // Decorator
export class User {
    // means jb bhi User naa kaa table banye gaa uss mein id naam kaa column ban jaye gaa in db and @PrimaryGeneratedColumn() means unique hoga wo and auto increment hoga
    @PrimaryGeneratedColumn()
    id: number;
    // so mene 4 columns banaye in db
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true }) // unique means duplicate email nhi honi chaiye in db
    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    // aik tenant k multiple users hosaktye hain, means many users to one tenant
    @ManyToOne(()=>Tenant) // aur dekho hum n pori Tenant entity hi pass krdi iss mein 
    tenant: Tenant; 

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
 