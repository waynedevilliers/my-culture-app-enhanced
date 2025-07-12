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
import { authorize } from "../middlewares/authorize.js";
import { generateCertificatePages } from "../controllers/generateCertificatePages.js";
import { sendCertificateEmail } from "../controllers/sendCertificateEmail.js";


const router = express.Router();

router
  .route("/")
  .get(pagination, findAllCertificates)
  .post(authenticate, authorize, createCertificate);

router.route("/published").get(findPublishedCertificates);

router.post("/generate-certificate/:id", authenticate, authorize, generateCertificatePages);

router.post("/send-certificate/:id", authenticate, authorize, sendCertificateEmail);

router
  .route("/:id")
  .get(findOneCertificateById)
  .put(authenticate, authorize, updateCertificate)
  .delete(authenticate, authorize, deleteCertificate);

export default router;
