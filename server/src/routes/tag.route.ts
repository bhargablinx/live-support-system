import { Router } from "express";
import { authorizeRole, verifyJwt } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createTagSchema,
    updateTagSchema,
    tagIdParamSchema,
} from "../validators/tag.validator.js";
import {
    getTags,
    createTag,
    updateTag,
    deleteTag,
} from "../controllers/tag.controller.js";

const tagRouter = Router();

tagRouter.use(verifyJwt);

tagRouter.get("/", getTags);
tagRouter.post("/", authorizeRole("ADMIN"), validate(createTagSchema), createTag);
tagRouter.patch("/:tagId", authorizeRole("ADMIN"), validate(updateTagSchema), updateTag);
tagRouter.delete("/:tagId", authorizeRole("ADMIN"), validate(tagIdParamSchema), deleteTag);

export default tagRouter;
