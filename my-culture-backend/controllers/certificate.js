import asyncWrapper from "../utils/asyncWrapper.js";
import { Certificate, CertificateRecipient } from "../db.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const findPublishedCertificates = asyncWrapper(async (req, res) => {
  const publishedCertificates = await Certificate.findAll({
    where: { published: true },
    limit: 5,
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json(publishedCertificates);
});

export const findAllCertificates = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, search = "", includeRecipients } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = search
    ? {
        title: {
          [Op.like]: `%${search}%`,
        },
      }
    : {};

  //  Ensure we only include recipients when requested
  const includeOptions =
    includeRecipients === "true"
      ? [{ model: CertificateRecipient, as: "recipients" }]
      : [];

  const entries = await Certificate.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    include: includeOptions,
  });

  const totalCount = entries.count;
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    totalCount,
    totalPages,
    currentPage: parseInt(page),
    hasNextPage: parseInt(page) < totalPages,
    hasPreviousPage: parseInt(page) > 1,
    results: entries.rows,
  });
});

export const findOneCertificateById = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const certificate = await Certificate.findByPk(id, {
    include: [{ model: CertificateRecipient, as: "recipients" }],
  });

  if (!certificate) throw new ErrorResponse("Certificate not found", 404);

  res.status(200).json(certificate);
});

export const createCertificate = asyncWrapper(async (req, res) => {
  const { title, description, issuedDate, issuedFrom, recipients } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new ErrorResponse("At least one recipient is required", 400);
  }

  // Validate each recipient's email
  for (const recipient of recipients) {
    if (!recipient.email || !/^\S+@\S+\.\S+$/.test(recipient.email)) {
      throw new ErrorResponse(
        `Invalid email for recipient: ${recipient.name}`,
        400
      );
    }
  }

  // Create Certificate
  const certificate = await Certificate.create({
    title,
    description,
    issuedDate,
    issuedFrom,
  });

  // Create Recipient Entries
  const recipientEntries = recipients.map((recipient) => ({
    name: recipient.name,
    email: recipient.email,
    certificateId: certificate.id,
  }));

  await CertificateRecipient.bulkCreate(recipientEntries);

  res.status(201).json({
    message: "Certificate created successfully",
    certificate,
    recipients: recipientEntries,
  });
});

export const updateCertificate = asyncWrapper(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const [updatedRows] = await Certificate.update(body, { where: { id } });

    if (updatedRows === 0) {
      return next(new ErrorResponse("Certificate not found", 404));
    }

    const updatedCertificate = await Certificate.findByPk(id);
    res.status(202).json(updatedCertificate);
  } catch (error) {
    next(error);
  }
});

export const deleteCertificate = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const deleted = await Certificate.destroy({ where: { id } });
  if (!deleted) throw new ErrorResponse("Certificate not found", 404);

  res
    .status(200)
    .json({ message: `Certificate with id ${id} was deleted successfully` });
});
