import { config } from "dotenv";
import { DataSource } from "typeorm";
import { AgentEntity } from "./src/database/entities/agent.entity";

config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [AgentEntity],
  migrations: ["src/database/migrations/*.ts"],
});
