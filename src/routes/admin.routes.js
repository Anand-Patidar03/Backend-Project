import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { getAllUsers, toggleBlockUser } from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT); // Apply to all admin routes
router.use(verifyAdmin); // Apply to all admin routes

router.route("/users").get(getAllUsers);
router.route("/users/:userId/block").patch(toggleBlockUser);

export default router;
