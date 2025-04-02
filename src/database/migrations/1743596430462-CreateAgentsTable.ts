import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentsTable1743596430462 implements MigrationInterface {
    name = 'CreateAgentsTable1743596430462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "agent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "isPublished" boolean NOT NULL DEFAULT false, "capabilities" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "agent"`);
    }

}
