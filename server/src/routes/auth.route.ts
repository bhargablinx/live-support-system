import { Router } from "express";
import { register, login, logout, refreshAccessToken, getMe } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router()

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.post("/logout", verifyJwt, logout)
router.get("/refresh-token", refreshAccessToken)
router.get("/me", verifyJwt, getMe)

export default router;

