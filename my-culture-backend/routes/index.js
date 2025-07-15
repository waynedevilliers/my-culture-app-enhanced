import express from "express";
import { dynamicModel } from "../middlewares/dynamicModel.js";
import { pagination } from "../middlewares/pagination.js";
import { authorize } from "../middlewares/authorize.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createOne,
  deleteOne,
  findAll,
  findOneById,
  updateOne,
} from "../controllers/CRUD.js";
import userRouter from "./userRouter.js";
import authRouter from "./authRouter.js";
import fileRouter from "./fileRouter.js";
import eventRouter from "./eventRouter.js";
import blogRouter from "./blogRouter.js";
import certificateRouter from "./certificateRouter.js";
import galleryRouter from "./galleryRouter.js";
import organizationRouter from "./organizationRouter.js";
import newsletterRouter from "./newsletterRouter.js";
import subscriberRouter from "./subscriberRouter.js";
import certificateTemplateRouter from "./certificateTemplates.js";
import certificatePdfRouter from "./certificatePdfRouter.js";
import cleanupRouter from "./cleanupRouter.js";
import queueRouter from "./queueRouter.js";
import secureCertificateRouter from "./secureCertificateRouter.js";
import tokenRouter from "./tokenRouter.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/events", eventRouter);
router.use("/file", fileRouter);
router.use("/blogs", blogRouter);
router.use("/galleries", galleryRouter);
router.use("/newsletters", newsletterRouter);
router.use("/subscribers", subscriberRouter);
router.use("/organizations", organizationRouter);
router.use("/certificates", certificateRouter);
router.use("/certificates", certificatePdfRouter);
router.use("/certificates", secureCertificateRouter);
router.use("/certificate-templates", certificateTemplateRouter);
router.use("/cleanup", cleanupRouter);
router.use("/queue", queueRouter);
router.use("/tokens", tokenRouter);
router.use("/:model", dynamicModel);

router
  .route("/:model")
  .get(pagination, findAll)
  .post(authenticate, authorize, validateRequest, createOne);

router
  .route("/:model/:id")
  .get(findOneById)
  .put(authenticate, authorize, validateRequest, updateOne)
  .delete(authenticate, authorize, deleteOne);

export default router;
