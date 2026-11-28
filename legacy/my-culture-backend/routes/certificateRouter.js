import express from "express";
import { pagination } from "../middlewares/pagination.js";
import {
  createCertificate,
  deleteCertificate,
  findAllCertificates,
  findPublishedCertificates,
  findOneCertificateById,
  updateCertificate,
} from "../controllers/certificate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize, authorizeAdminOrSuperAdmin } from "../middlewares/authorize.js";
import { generateCertificatePages } from "../controllers/generateCertificatePages.js";
import { sendCertificateEmail } from "../controllers/sendCertificateEmail.js";


const router = express.Router();

router
  .route("/")
  .get(pagination, findAllCertificates)
  .post(authenticate, authorizeAdminOrSuperAdmin, createCertificate);

router.route("/published").get(findPublishedCertificates);

router.post("/generate-certificate/:id", authenticate, authorizeAdminOrSuperAdmin, generateCertificatePages);

router.post("/send-certificate/:id", authenticate, authorizeAdminOrSuperAdmin, sendCertificateEmail);

router
  .route("/:id")
  .get(findOneCertificateById)
  .put(authenticate, authorizeAdminOrSuperAdmin, updateCertificate)
  .delete(authenticate, authorizeAdminOrSuperAdmin, deleteCertificate);

export default router;
