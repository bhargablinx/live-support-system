import "dotenv/config"
import app from "./app.js"
import { createServer } from "http"
import { Server } from "socket.io"

const PORT = process.env.PORT

const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: { origin: "*" }
})

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})