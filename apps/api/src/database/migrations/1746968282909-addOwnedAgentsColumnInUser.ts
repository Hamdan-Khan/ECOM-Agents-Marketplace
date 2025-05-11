import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnedAgentsColumnInUser1746968282909 implements MigrationInterface {
    name = 'AddOwnedAgentsColumnInUser1746968282909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_owned_agents" ("user_id" uuid NOT NULL, "agent_id" uuid NOT NULL, CONSTRAINT "PK_c4c78a3ae7ccd742bd1a72da304" PRIMARY KEY ("user_id", "agent_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74377cd72fbca008afece923ac" ON "user_owned_agents" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b76da46c1f49d7c349d02cb051" ON "user_owned_agents" ("agent_id") `);
        await queryRunner.query(`ALTER TYPE "public"."payments_payment_gateway_enum" RENAME TO "payments_payment_gateway_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_gateway_enum" AS ENUM('STRIPE')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_gateway" TYPE "public"."payments_payment_gateway_enum" USING "payment_gateway"::"text"::"public"."payments_payment_gateway_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_gateway_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_owned_agents" ADD CONSTRAINT "FK_74377cd72fbca008afece923ac9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_owned_agents" ADD CONSTRAINT "FK_b76da46c1f49d7c349d02cb0511" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_owned_agents" DROP CONSTRAINT "FK_b76da46c1f49d7c349d02cb0511"`);
        await queryRunner.query(`ALTER TABLE "user_owned_agents" DROP CONSTRAINT "FK_74377cd72fbca008afece923ac9"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_gateway_enum_old" AS ENUM('JAZZCASH', 'PAYPRO')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_gateway" TYPE "public"."payments_payment_gateway_enum_old" USING "payment_gateway"::"text"::"public"."payments_payment_gateway_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_gateway_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_payment_gateway_enum_old" RENAME TO "payments_payment_gateway_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b76da46c1f49d7c349d02cb051"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74377cd72fbca008afece923ac"`);
        await queryRunner.query(`DROP TABLE "user_owned_agents"`);
    }

}
