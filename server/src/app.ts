import cors from "cors"
import cookieParser from "cookie-parser"
import express, { type Express } from 'express';
import healthRouter from "./routes/health.route.js"
import authRouter from "./routes/auth.route.js"
import visitorRouter from './routes/visitor.route.js'
import conversationRouter from './routes/conversation.route.js'
import agentRouter from './routes/agent.route.js'
import analyticsRouter from "./routes/analytics.route.js"
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded())
app.use(cookieParser())


// ROUTERS
app.use("/api/v1/health", healthRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/visitor", visitorRouter)
app.use("/api/v1/conversation", conversationRouter)
app.use("/api/v1/agents", agentRouter)
app.use("/api/v1/analytics", analyticsRouter)


app.use(errorHandler)

export default app