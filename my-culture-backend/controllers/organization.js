import asyncWrapper from "../utils/asyncWrapper.js";
import {Organization, User} from "../db.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { Image } from "../db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

export const findPublishedOrganizations = asyncWrapper(async (req, res) => {
  const publishedOrganizations = await Organization.findAll({
    where: {
      published: true,
    },
    limit: 5,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: { model: Image},
  });

  res.status(200).json( publishedOrganizations);
});

export const findAllOrganizations = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = res.pagination;

  const entries = await Organization.findAndCountAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: { model: Image, required: false }, 
  });

  const totalCount = entries.count;
  const totalPages = Math.ceil(totalCount / limit);

  const paginationData = {
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  res.status(200).json({ ...paginationData, results: entries.rows });
});

export const findOneOrganizationById = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const entry = await Organization.findByPk(id, {
    include: { model: Image },
  });
  res.status(200).json(entry);
});

export const createOrganization = asyncWrapper(async (req, res) => {
  const { body } = req;
  const { name, description, website, phone, email, imageId } = body; 

  const organization = await Organization.create({
    name,
    description,
    website,
    phone,
    email,
    imageId: imageId || null,  
  });

  res.status(201).json(organization);
});

export const updateOrganization = asyncWrapper(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const [updatedRows] = await Organization.update(body, { where: { id } });

    if (updatedRows === 0) {
      return next(new ErrorResponse("Entry not found", 404));
    }

    const newOrganization = await Organization.findByPk(id, {
      include: { model: Image },
    });

    res.status(202).json(newOrganization);
  } catch (error) {
    next(error);
  }
});



export const deleteOrganization = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;

  const deleted = await Organization.destroy({ where: { id } });
  if (!deleted) throw new ErrorResponse("Entry not found", 404);


  const responseMessage = {
    message: `Entry with id ${id} was deleted successfully`,
  };
  res.status(200).json(responseMessage);
});

export const applyForOrganization = asyncWrapper(async (req, res) => {
  const { body } = req;
  const { 
    organizationName, 
    organizationType, 
    description, 
    website, 
    email, 
    phone, 
    contactPerson,
    location,
    establishedYear,
    memberCount,
    programs,
    goals,
    additionalInfo
  } = body;
  
  // Get logo URL from cloudinary upload if available
  const logo = req.cloudinaryURL || null;

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create organization application with published: false (pending email verification)
  const organization = await Organization.create({
    name: organizationName,
    description: `${description}\n\nContact: ${contactPerson}\nLocation: ${location}\nEstablished: ${establishedYear || 'N/A'}\nMembers: ${memberCount || 'N/A'}\nType: ${organizationType}\nPrograms: ${programs || 'N/A'}\nGoals: ${goals || 'N/A'}\nAdditional Info: ${additionalInfo || 'N/A'}`,
    website,
    phone,
    email,
    contactPerson,
    logo,
    published: false, // Will be set to true after email verification
    emailVerified: false,
    emailVerificationToken,
  });

  // Send verification email
  await sendVerificationEmail(organization, emailVerificationToken);

  res.status(201).json({
    message: "Organization application submitted successfully. Please check your email to verify your account.",
    organization: {
      id: organization.id,
      name: organization.name,
      email: organization.email,
      emailVerified: organization.emailVerified
    }
  });
});

export const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.params;

  // Find organization with this token
  const organization = await Organization.findOne({
    where: { emailVerificationToken: token }
  });

  if (!organization) {
    throw new ErrorResponse("Invalid or expired verification token", 400);
  }

  // Verify email and publish organization
  await organization.update({
    emailVerified: true,
    published: true,
    emailVerificationToken: null
  });

  // Create admin user account for this organization
  const tempPassword = generateRandomPassword();
  const adminUser = await User.create({
    firstName: organization.contactPerson?.split(' ')[0] || 'Admin',
    lastName: organization.contactPerson?.split(' ').slice(1).join(' ') || 'User',
    email: organization.email,
    password: tempPassword, // Generate secure password
    role: 'admin',
    organizationId: organization.id,
    newsletter: false
  });

  // Send admin credentials email
  await sendAdminCredentialsEmail(organization, tempPassword);

  res.status(200).json({
    message: "Email verified successfully! Your organization is now active.",
    organization: {
      id: organization.id,
      name: organization.name,
      email: organization.email,
      emailVerified: organization.emailVerified,
      published: organization.published
    },
    adminUser: {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    }
  });
});

// Helper function to send verification email
const sendVerificationEmail = async (organization, token) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `${process.env.URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: organization.email,
    subject: 'Verify Your Organization Registration - My Culture App / E-Mail-Verifizierung',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to My Culture App! / Willkommen bei My Culture App!</h2>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #555; border-bottom: 2px solid #007bff; padding-bottom: 5px;">English</h3>
          <p>Thank you for registering your organization <strong>${organization.name}</strong>.</p>
          <p>Please click the button below to verify your email address and activate your account:</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #555; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Deutsch</h3>
          <p>Vielen Dank für die Registrierung Ihrer Organisation <strong>${organization.name}</strong>.</p>
          <p>Bitte klicken Sie auf die Schaltfläche unten, um Ihre E-Mail-Adresse zu verifizieren und Ihr Konto zu aktivieren:</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address / E-Mail verifizieren
          </a>
        </div>
        
        <p><strong>English:</strong> Or copy and paste this link into your browser:</p>
        <p><strong>Deutsch:</strong> Oder kopieren Sie diesen Link in Ihren Browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <div style="margin: 30px 0;">
          <p><strong>English:</strong> Once verified, you'll be able to:</p>
          <ul>
            <li>Create and send certificates</li>
            <li>Manage your organization profile</li>
            <li>Access your admin dashboard</li>
          </ul>
          
          <p><strong>Deutsch:</strong> Nach der Verifizierung können Sie:</p>
          <ul>
            <li>Zertifikate erstellen und versenden</li>
            <li>Ihr Organisationsprofil verwalten</li>
            <li>Auf Ihr Admin-Dashboard zugreifen</li>
          </ul>
        </div>
        
        <p><strong>English:</strong> If you didn't register for this account, please ignore this email.</p>
        <p><strong>Deutsch:</strong> Wenn Sie sich nicht für dieses Konto registriert haben, ignorieren Sie bitte diese E-Mail.</p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">My Culture App - Digital Certificate Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Helper function to send admin credentials email
const sendAdminCredentialsEmail = async (organization, password) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const loginUrl = `${process.env.URL}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: organization.email,
    subject: 'Your Admin Account is Ready - My Culture App / Ihr Admin-Konto ist bereit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Admin Account is Ready! / Ihr Admin-Konto ist bereit!</h2>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #555; border-bottom: 2px solid #28a745; padding-bottom: 5px;">English</h3>
          <p>Great news! Your organization <strong>${organization.name}</strong> has been verified and your admin account is now active.</p>
          <p>You can now log in to your admin dashboard and start creating certificates.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #555; border-bottom: 2px solid #28a745; padding-bottom: 5px;">Deutsch</h3>
          <p>Großartige Neuigkeiten! Ihre Organisation <strong>${organization.name}</strong> wurde verifiziert und Ihr Admin-Konto ist jetzt aktiv.</p>
          <p>Sie können sich jetzt in Ihr Admin-Dashboard einloggen und mit der Erstellung von Zertifikaten beginnen.</p>
        </div>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 30px 0;">
          <h4 style="margin: 0 0 15px 0; color: #333;">Login Credentials / Anmeldedaten:</h4>
          <p style="margin: 5px 0;"><strong>Email / E-Mail:</strong> ${organization.email}</p>
          <p style="margin: 5px 0;"><strong>Password / Passwort:</strong> <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px;">${password}</code></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Dashboard / Zum Dashboard
          </a>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>Security Note / Sicherheitshinweis:</strong></p>
          <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
            <strong>English:</strong> Please change this temporary password after your first login for security reasons.<br>
            <strong>Deutsch:</strong> Bitte ändern Sie dieses temporäre Passwort aus Sicherheitsgründen nach Ihrer ersten Anmeldung.
          </p>
        </div>
        
        <div style="margin: 30px 0;">
          <p><strong>English:</strong> What you can do now:</p>
          <ul>
            <li>Access your organization dashboard</li>
            <li>Create and customize certificates</li>
            <li>Send certificates to recipients</li>
            <li>Manage your organization profile</li>
          </ul>
          
          <p><strong>Deutsch:</strong> Was Sie jetzt tun können:</p>
          <ul>
            <li>Auf Ihr Organisations-Dashboard zugreifen</li>
            <li>Zertifikate erstellen und anpassen</li>
            <li>Zertifikate an Empfänger senden</li>
            <li>Ihr Organisationsprofil verwalten</li>
          </ul>
        </div>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">My Culture App - Digital Certificate Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Helper function to generate random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};
