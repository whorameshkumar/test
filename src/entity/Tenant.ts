import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
@Entity({name:"tenants"}) // Decorator 
export class Tenant {
    // so 5 columns banaye id, name, address, updatedAt, createdAt 
    // means jb bhi User naa kaa table banye gaa uss mein id naam kaa column ban jaye gaa in db and @PrimaryGeneratedColumn() means unique hoga wo and auto increment hoga
    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar", {length:100}) // name ki length 100 define kri hai hum n
    name: string; 
    
    @Column("varchar", {length:255}) // address ki length 255 define kri hai hum n
    address: string; 
    
    @UpdateDateColumn()
    updatedAt: number;
    
    @CreateDateColumn()
    createdAt: number; 
}