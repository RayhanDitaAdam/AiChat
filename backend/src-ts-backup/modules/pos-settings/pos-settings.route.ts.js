import { Router } from "express";
import * as settingsController from "./pos-settings.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, settingsController.getSettings);
router.post("/", authenticate, settingsController.updateSettings);

export default router;
