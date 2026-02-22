import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import * as contributorController from "./contributor.controller.js";
import { validate } from "../../common/middleware/zod.middleware.js";
import { createContributorRequestSchema, updateContributorRequestStatusSchema } from "./contributor.schema.js";
import rateLimit from 'express-rate-limit';
const router = Router();
const contributorRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many contributor requests. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});
// User routes
router.get("/my-requests", authenticate, contributorController.getMyRequests);
router.post("/request", authenticate, contributorRequestLimiter, validate(createContributorRequestSchema), contributorController.createRequest);
router.delete("/requests/:requestId", authenticate, contributorController.deleteRequest);
// Owner routes
router.get("/requests", authenticate, contributorController.getPendingRequests);
router.put("/requests/:requestId", authenticate, validate(updateContributorRequestStatusSchema), contributorController.updateRequestStatus);
router.get("/list", authenticate, contributorController.listContributors);
export default router;
//# sourceMappingURL=contributor.route.js.map