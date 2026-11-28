import express from "express";
import { subscribeSubscriber, unsubscribeSubscriber, verifySubscriber } from '../controllers/subscriber.js';

const router = express.Router();

router.post("/add", subscribeSubscriber);
router.get("/verify", verifySubscriber);
router.get("/remove", unsubscribeSubscriber);

export default router;