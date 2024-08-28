import { MigrationInterface, QueryRunner } from "typeorm";
export class RenameTables1724660283125 implements MigrationInterface {

    name = 'RenameTables1724660283125'

    public async up(queryRunner: QueryRunner): Promise<void> { // to run new migration to make latest changes 
        
        // sb sye phlye iss FK_8e913e288156c133999341156ad forign key constrant ko delete kr rehye hai  
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`); // FK_8e913e288156c133999341156ad yhe value different hogi open dbGate then public.migrations then Open structures then copy forign key
        
        // rename krdia from user to users 
        await queryRunner.renameTable("user", "users");
        
        // rename krdia from refresh_token to refreshTokens   
        await queryRunner.renameTable("refresh_token", "refreshTokens");       
        
        //await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        //await queryRunner.query(`CREATE TABLE "refreshTokens" ("id" SERIAL NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_c4a0078b846c2c4508473680625" PRIMARY KEY ("id"))`);   
        
        // adding new forign key 
        await queryRunner.query(`ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {  // down method to revert the migration 
        await queryRunner.query(`ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`);
        
        //await queryRunner.query(`DROP TABLE "refreshTokens"`);
        //await queryRunner.query(`DROP TABLE "users"`);
        
        await queryRunner.renameTable("users", "user"); // rename krdia from users to user, basically revert back krdia 
        await queryRunner.renameTable("refreshTokens", "refresh_token"); // rename krdia from refreshTokens to refresh_token 
    }

}