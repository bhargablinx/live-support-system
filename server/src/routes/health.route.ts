import { Router } from "express";
import { cheakHealth } from "../controllers/health.controller.js";

const router = Router();

router.get("/", cheakHealth)

export default router