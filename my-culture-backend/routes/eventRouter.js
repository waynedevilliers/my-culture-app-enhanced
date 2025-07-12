import express from "express";
import { pagination } from '../middlewares/pagination.js';
import {
  createEvent, deleteEvent,
  findAllEvents,
  findNextEvent,
  findOneEventById,
  updateEvent,
} from '../controllers/event.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router
.route("/")
.get(pagination, findAllEvents)
.post(authenticate, authorize, createEvent)

router
.route("/next")
.get(findNextEvent)

router
.route("/:id")
.get(findOneEventById)
.put(authenticate, authorize, updateEvent)
.delete(authenticate, authorize, deleteEvent)

export default router;