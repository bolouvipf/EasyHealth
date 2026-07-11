import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { ValidationPipe, VersioningType } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import helmet from "helmet"
import * as fs from "fs"
import * as path from "path"
import { AppModule } from "./app.module"

async function bootstrap() {
  process.on("uncaughtException", (err) => { console.error("UNCAUGHT", err); process.exit(1) })
  process.on("unhandledRejection", (err) => { console.error("UNHANDLED", err) })

  const dbPath = process.env.DB_PATH || "./data/easyhealth.db"
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  console.log("Starting NestFactory...")
  const app = await NestFactory.create(AppModule)
  console.log("NestFactory created")

  app.setGlobalPrefix("api")
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })

  app.use(helmet())

  const isProduction = process.env.NODE_ENV === "production"

  app.enableCors({
    origin: isProduction
      ? [
          "https://easy-health-wine.vercel.app",
          "https://easy-health-pierre-florent-bolouvi-s-projects.vercel.app",
        ]
      : ["http://localhost:5173", "http://localhost:4173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })

  if (isProduction) {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(301, "https://" + req.headers.host + req.url)
      }
      next()
    })
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle("EasyHealth API")
      .setDescription("API du Dossier de Santé partagé EasyHealth")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api/docs", app, document)
    console.log(`Swagger docs: http://localhost:${process.env.PORT || 3000}/api/docs`)
  }

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`EasyHealth API running on http://localhost:${port}`)
}

bootstrap()
