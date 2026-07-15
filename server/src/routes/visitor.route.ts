import { Router } from "express";
import { createVisitor } from "../controllers/visitor.controller.js";

const router = Router()

router.post("/", createVisitor)

export default router;