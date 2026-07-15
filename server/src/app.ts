import cors from "cors"
import cookieParser from "cookie-parser"
import express, { type Express } from 'express';
import healthRouter from "./routes/health.route.js"
import authRouter from "./routes/auth.route.js"
import visitorRouter from './routes/visitor.route.js'
import conversationRouter from './routes/conversation.route.js'
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticateSocket } from "./socket/authenticateSocket.js";
import { io } from "./index.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded())
app.use(cookieParser())

io.use(authenticateSocket)

// ROUTERS
app.use("/api/v1/health", healthRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/visitor", visitorRouter)
app.use("/api/v1/conversation", conversationRouter)


app.use(errorHandler)

export default app