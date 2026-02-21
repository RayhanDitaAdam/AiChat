import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import * as contributorController from "./contributor.controller.js";
import { validate } from "../../common/middleware/zod.middleware.js";
import { createContributorRequestSchema, updateContributorRequestStatusSchema } from "./contributor.schema.js";
const router = Router();
// User routes
router.post("/request", authenticate, validate(createContributorRequestSchema), contributorController.createRequest);
// Owner routes
router.get("/requests", authenticate, contributorController.getPendingRequests);
router.put("/requests/:requestId", authenticate, validate(updateContributorRequestStatusSchema), contributorController.updateRequestStatus);
router.get("/list", authenticate, contributorController.listContributors);
export default router;
//# sourceMappingURL=contributor.route.js.map