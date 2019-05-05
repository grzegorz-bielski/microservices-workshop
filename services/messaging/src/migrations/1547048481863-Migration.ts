import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1547048481863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL, "content" text NOT NULL, "createdAt" bigint NOT NULL, "username" character varying NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "message"`);
  }
}
