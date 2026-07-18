import "dotenv/config"
import app from "./app.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { registerSocketHandlers } from "./socket/index.js"

const PORT = process.env.PORT

const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://localhost:3000"],
        credentials: true
    }
})

app.set("io", io);

registerSocketHandlers(io)

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})