import express from "express";
import { pagination } from "../middlewares/pagination.js";
import {
  createOrganization,
  deleteOrganization,
  findAllOrganizations,
  findPublishedOrganizations,
  findOneOrganizationById,
  updateOrganization,
  applyForOrganization,
  verifyEmail,
} from "../controllers/organization.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import fileUploader from "../middlewares/fileUploader.js";
import cloudUploader from "../middlewares/cloudUploader.js";

const router = express.Router();

router
  .route("/")
  .get(pagination, findAllOrganizations)
  .post(authenticate, authorize, createOrganization);

router.route("/published").get(findPublishedOrganizations);

router.route("/apply").post(fileUploader.single('logo'), cloudUploader, applyForOrganization);

router.route("/verify-email/:token").get(verifyEmail);

router
  .route("/:id")
  .get(findOneOrganizationById)
  .put(authenticate, authorize, updateOrganization)
  .delete(authenticate, authorize, deleteOrganization);

export default router;
