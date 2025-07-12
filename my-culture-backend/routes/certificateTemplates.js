import express from 'express';
import { getAllTemplates, getTemplatesByCategory, getTemplateById } from '../utils/certificateTemplates.js';
import asyncWrapper from '../utils/asyncWrapper.js';

const router = express.Router();

// Get all available certificate templates
router.get('/', asyncWrapper(async (req, res) => {
  const templates = getAllTemplates();
  
  // Return basic template info (without full style objects for performance)
  const templateList = templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    preview: template.preview,
    category: template.category
  }));

  res.status(200).json({
    success: true,
    data: templateList
  });
}));

// Get templates by category
router.get('/category/:category', asyncWrapper(async (req, res) => {
  const { category } = req.params;
  const templates = getTemplatesByCategory(category);
  
  const templateList = templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    preview: template.preview,
    category: template.category
  }));

  res.status(200).json({
    success: true,
    data: templateList,
    category
  });
}));

// Get full template details by ID
router.get('/:templateId', asyncWrapper(async (req, res) => {
  const { templateId } = req.params;
  const template = getTemplateById(templateId);

  res.status(200).json({
    success: true,
    data: template
  });
}));

// Get template preview HTML
router.get('/:templateId/preview', asyncWrapper(async (req, res) => {
  const { templateId } = req.params;
  const { participant, event, issueDate, signature, organizationName } = req.query;
  const template = getTemplateById(templateId);
  
  // Use query parameters or fallback to sample data
  const previewData = {
    participant: participant || "John Doe",
    event: event || "Sample Event",
    issueDate: issueDate || new Date().toDateString(),
    signature: signature || "Director Name",
    organizationName: organizationName || "Sample Organization"
  };
  
  const { generateCertificateHTML } = await import('../utils/certificateTemplates.js');
  const previewHTML = generateCertificateHTML(template, previewData);

  res.setHeader('Content-Type', 'text/html');
  res.send(previewHTML);
}));

export default router;