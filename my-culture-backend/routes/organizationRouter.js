import express from "express";
import { pagination } from "../middlewares/pagination.js";
import {
  createOrganization,
  deleteOrganization,
  findAllOrganizations,
  findPublishedOrganizations,
  findOneOrganizationById,
  updateOrganization,
} from "../controllers/organization.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

router
  .route("/")
  .get(pagination, findAllOrganizations)
  .post(authenticate, authorize, createOrganization);

router.route("/published").get(findPublishedOrganizations);

router
  .route("/:id")
  .get(findOneOrganizationById)
  .put(authenticate, authorize, updateOrganization)
  .delete(authenticate, authorize, deleteOrganization);

export default router;
