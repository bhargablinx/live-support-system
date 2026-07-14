import cors from "cors"
import express, { type Express } from 'express';
import healthRouter from "./routes/health.route.js"
import authRouter from "./routes/auth.route.js"
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded())

// ROUTERS
app.use("/api/v1/health", healthRouter)
app.use("/api/v1/auth", authRouter)

app.use(errorHandler)

export default app