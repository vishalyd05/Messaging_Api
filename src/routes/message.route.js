import { Router } from "express";
import {
  allMessages,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/:sender/:receiver").post(sendMessage);
router.route("/allmessage").get(allMessages);
router.route("/:sender/:receiver").get(getMessages);

export default router;
