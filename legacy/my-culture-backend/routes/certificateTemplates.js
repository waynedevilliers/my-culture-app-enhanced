import express from 'express';
import { getAllTemplates, getTemplatesByCategory, getTemplateById } from '../utils/certificateTemplates.js';
import { authenticateToken } from '../middlewares/auth.js';
import { Organization } from '../db.js';
import asyncWrapper from '../utils/asyncWrapper.js';

const router = express.Router();

// Get all available certificate templates with role-based filtering
router.get('/', authenticateToken, asyncWrapper(async (req, res) => {
  try {
    const user = req.user;
    let templates = getAllTemplates();
    
    // Filter templates based on user role and organization
    if (user.role === 'admin') {
      // Organization admins see organization-specific templates plus defaults
      const organization = await Organization.findByPk(user.organizationId);
      
      if (!organization) {
        return res.status(404).json({
          error: 'Organization not found'
        });
      }
      
      // For now, return all templates but in future can be filtered by organization
      // TODO: Implement organization-specific template storage
      templates = templates.map(template => ({
        ...template,
        organizationId: user.organizationId,
        organizationName: organization.name,
        accessLevel: 'organization'
      }));
      
    } else if (user.role === 'superAdmin') {
      // Super admins see all templates including system-wide ones
      templates = templates.map(template => ({
        ...template,
        accessLevel: 'system'
      }));
      
    } else {
      // Regular users get limited access or redirect to their organization admin
      return res.status(403).json({
        error: 'Insufficient permissions to view templates',
        message: 'Contact your organization administrator for certificate access'
      });
    }
    
    // Return filtered template info (without full style objects for performance)
    const templateList = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      preview: template.preview,
      category: template.category,
      organizationId: template.organizationId,
      organizationName: template.organizationName,
      accessLevel: template.accessLevel
    }));

    res.status(200).json({
      success: true,
      userRole: user.role,
      organizationId: user.organizationId,
      data: templateList
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      error: 'Failed to fetch templates'
    });
  }
}));

// Get templates by category with role-based filtering
router.get('/category/:category', authenticateToken, asyncWrapper(async (req, res) => {
  try {
    const { category } = req.params;
    const user = req.user;
    
    // Check user permissions first
    if (user.role === 'user') {
      return res.status(403).json({
        error: 'Insufficient permissions to view templates',
        message: 'Contact your organization administrator for certificate access'
      });
    }
    
    let templates = getTemplatesByCategory(category);
    
    // Apply role-based filtering
    if (user.role === 'admin') {
      const organization = await Organization.findByPk(user.organizationId);
      if (!organization) {
        return res.status(404).json({
          error: 'Organization not found'
        });
      }
      
      templates = templates.map(template => ({
        ...template,
        organizationId: user.organizationId,
        organizationName: organization.name,
        accessLevel: 'organization'
      }));
    } else if (user.role === 'superAdmin') {
      templates = templates.map(template => ({
        ...template,
        accessLevel: 'system'
      }));
    }
    
    const templateList = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      preview: template.preview,
      category: template.category,
      organizationId: template.organizationId,
      organizationName: template.organizationName,
      accessLevel: template.accessLevel
    }));

    res.status(200).json({
      success: true,
      userRole: user.role,
      organizationId: user.organizationId,
      data: templateList,
      category
    });
    
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    res.status(500).json({
      error: 'Failed to fetch templates'
    });
  }
}));

// Get full template details by ID with role-based access control
router.get('/:templateId', authenticateToken, asyncWrapper(async (req, res) => {
  try {
    const { templateId } = req.params;
    const user = req.user;
    
    // Check user permissions
    if (user.role === 'user') {
      return res.status(403).json({
        error: 'Insufficient permissions to view template details',
        message: 'Contact your organization administrator for certificate access'
      });
    }
    
    const template = getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        error: 'Template not found'
      });
    }
    
    // Add organization context for admins
    let templateWithContext = { ...template };
    if (user.role === 'admin') {
      const organization = await Organization.findByPk(user.organizationId);
      if (!organization) {
        return res.status(404).json({
          error: 'Organization not found'
        });
      }
      
      templateWithContext = {
        ...template,
        organizationId: user.organizationId,
        organizationName: organization.name,
        accessLevel: 'organization'
      };
    } else if (user.role === 'superAdmin') {
      templateWithContext = {
        ...template,
        accessLevel: 'system'
      };
    }

    res.status(200).json({
      success: true,
      userRole: user.role,
      organizationId: user.organizationId,
      data: templateWithContext
    });
    
  } catch (error) {
    console.error('Error fetching template details:', error);
    res.status(500).json({
      error: 'Failed to fetch template details'
    });
  }
}));

// Get template preview HTML with role-based access control
router.get('/:templateId/preview', authenticateToken, asyncWrapper(async (req, res) => {
  try {
    const { templateId } = req.params;
    const { participant, event, issueDate, signature, organizationName } = req.query;
    const user = req.user;
    
    // Check user permissions
    if (user.role === 'user') {
      return res.status(403).json({
        error: 'Insufficient permissions to preview templates',
        message: 'Contact your organization administrator for certificate access'
      });
    }
    
    const template = getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        error: 'Template not found'
      });
    }
    
    // Get organization context for preview data
    let defaultOrgName = "Sample Organization";
    if (user.role === 'admin' && user.organizationId) {
      const organization = await Organization.findByPk(user.organizationId);
      if (organization) {
        defaultOrgName = organization.name;
      }
    }
    
    // Use query parameters or fallback to sample data
    const previewData = {
      participant: participant || "John Doe",
      event: event || "Sample Event",
      issueDate: issueDate || new Date().toDateString(),
      signature: signature || "Director Name",
      organizationName: organizationName || defaultOrgName
    };
    
    const { generateCertificateHTML } = await import('../utils/certificateTemplates.js');
    const previewHTML = generateCertificateHTML(template, previewData);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // Prevent indexing of previews
    res.send(previewHTML);
    
  } catch (error) {
    console.error('Error generating template preview:', error);
    res.status(500).json({
      error: 'Failed to generate template preview'
    });
  }
}));

export default router;