import { Router } from "express";
import { follow, unfollow } from "../controllers/follows.controller.js";

const router = Router();

router.route("/:followTo/:follower").post(follow);
router.route("/unfollow/:followTo/:follower").post(unfollow);

export default router;
