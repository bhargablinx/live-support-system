import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { z } from "zod";
import { validate } from "../validate.middleware.js";
import { errorHandler } from "../errorHandler.js";

describe("Validation Middleware (validate)", () => {
    const testSchema = z.object({
        body: z.object({
            email: z.string().email("Invalid email address"),
            age: z.number().min(18, "Age must be at least 18"),
        }),
    });

    const createTestApp = () => {
        const app = express();
        app.use(express.json());
        app.post("/test", validate(testSchema), (req, res) => {
            res.status(200).json({ success: true, data: req.body });
        });
        app.use(errorHandler);
        return app;
    };

    it("should pass validation with valid body", async () => {
        const app = createTestApp();
        const res = await request(app)
            .post("/test")
            .send({ email: "user@example.com", age: 25 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should reject with 400 Bad Request when validation fails", async () => {
        const app = createTestApp();
        const res = await request(app)
            .post("/test")
            .send({ email: "not-an-email", age: 15 });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("email: Invalid email address");
        expect(res.body.message).toContain("age: Age must be at least 18");
    });
});
