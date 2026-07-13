import cors from "cors"
import express, { type Express } from 'express';
import healthRouter from "./routes/health.route.js"

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded())

// ROUTERS
app.use("/api/v1/health", healthRouter)

export default app