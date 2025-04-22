import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrationOrder1745234846022 implements MigrationInterface {
    name = 'NewMigrationOrder1745234846022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "created_by" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "created_by"`);
    }

}
