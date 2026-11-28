import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { sendBulkEmail } from '../utils/newsletter.js';
import sanitizeHtml from 'sanitize-html';
import { Newsletter } from '../db.js';

export const sendNewsletter = asyncWrapper(async (req, res) => {
  const { subject, content } = req.body;

  if (!subject || !content) {
    throw new ErrorResponse("Bitte geben Sie Betreff und Inhalt an.", 400);
  }

  await sendBulkEmail(subject, content);
  res.status(200).json({ message: "Newsletter erfolgreich versendet." });
});

export const createNewsletter = asyncWrapper(async (req, res) => {
  const { body } = req;

  console.log(sanitizeHtml(body.content).toString());

  const entry = await Newsletter.create(body);

  res.status(201).json(entry);
})