import { Router } from "express";
import { register, login, logout, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", verifyJwt, logout)
router.get("/refresh-token", verifyJwt, refreshAccessToken)


export default router;

