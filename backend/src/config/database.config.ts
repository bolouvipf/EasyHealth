import { registerAs } from "@nestjs/config"

export default registerAs("database", () => ({
  type: process.env.DB_TYPE || "sqlite",
  path: process.env.DB_PATH || "./data/easyhealth.db",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || "easyhealth",
}))
