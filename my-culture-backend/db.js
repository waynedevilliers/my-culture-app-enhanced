import { Sequelize } from "sequelize";
import UserModel from "./models/User.js";
import EventModel from "./models/Event.js";
import ImageModel from "./models/Image.js";
import LocationModel from "./models/Location.js";
import TestimonialModel from "./models/Testimonial.js";
import CategoryModel from "./models/Category.js";
import EventCategoryModel from "./models/EventCategory.js";
import GalleryModel from "./models/Gallery.js";
import OrganizationModel from "./models/Organization.js";
import BlogModel from "./models/Blog.js";
import ImageGalleryModel from "./models/ImageGallery.js";
import SubscriberModel from "./models/Subscriber.js";
import NewsletterModel from "./models/Newsletter.js";
import CertificateModel from "./models/Certificate.js";
import CertificateRecipientModel from "./models/CertificateRecipient.js";

// Check for database connection string
const dbConnectionString = process.env.DATABASE_URL || process.env.DB;
if (!dbConnectionString) {
  console.error('Database connection string not found. Please set DATABASE_URL or DB environment variable.');
  // In serverless, don't exit - just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

let sequelize = null;
if (dbConnectionString) {
  sequelize = new Sequelize(dbConnectionString, { 
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
}

let User, Event, Image, Location, Testimonial, Category, Gallery, Organization, Blog, EventCategory, ImageGallery, Subscriber, Newsletter, Certificate, CertificateRecipient;

if (sequelize) {
  User = UserModel(sequelize);
  Event = EventModel(sequelize);
  Image = ImageModel(sequelize);
  Location = LocationModel(sequelize);
  Testimonial = TestimonialModel(sequelize);
  Category = CategoryModel(sequelize);
  Gallery = GalleryModel(sequelize);
  Organization = OrganizationModel(sequelize);
  Blog = BlogModel(sequelize);
  EventCategory = EventCategoryModel(sequelize);
  ImageGallery = ImageGalleryModel(sequelize);
  Subscriber = SubscriberModel(sequelize);
  Newsletter = NewsletterModel(sequelize);
  Certificate = CertificateModel(sequelize);
  CertificateRecipient = CertificateRecipientModel(sequelize);
} else {
  console.warn('Database models not initialized - no database connection');
}

if (sequelize && User && Event && Image && Location && Organization && Blog && Category && Gallery && Certificate && CertificateRecipient) {
  User.hasMany(Event, { foreignKey: "userId" });
  Event.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(Image, { foreignKey: "userId" });
  Image.belongsTo(User, { foreignKey: "userId" });

  Event.belongsTo(Image, { foreignKey: "imageId" });
  Image.hasMany(Event, { foreignKey: "imageId" });

  Organization.belongsTo(Image, { foreignKey: "imageId" });
  Image.hasMany(Organization, { foreignKey: "imageId" });

  // User-Organization relationship (one organization can have one admin user)
  User.belongsTo(Organization, { foreignKey: "organizationId" });
  Organization.hasOne(User, { foreignKey: "organizationId" });

  Event.belongsTo(Location, { foreignKey: "locationId" });
  Location.hasMany(Event, { foreignKey: "locationId" });

  User.hasMany(Blog, { foreignKey: "userId" });
  Blog.belongsTo(User, { foreignKey: "userId" });

  Image.hasMany(Blog, { foreignKey: "imageId" });
  Blog.belongsTo(Image, { foreignKey: "imageId" });

  Event.belongsToMany(Category, { through: "EventCategory" });
  Category.belongsToMany(Event, { through: "EventCategory" });

  Image.belongsToMany(Gallery, { through: "ImageGallery" });
  Gallery.belongsToMany(Image, { through: "ImageGallery" });

  Certificate.hasMany(CertificateRecipient, {
    foreignKey: "certificateId",
    as: "recipients",
  });
  CertificateRecipient.belongsTo(Certificate, {
    foreignKey: "certificateId",
    as: "certificate",
  });
}

// Initialize database connection (for serverless, sync happens lazily)
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    
    // Only sync in development or when explicitly needed
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      console.log("Database synchronized successfully.");
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

// For serverless environments, we don't sync at startup
if (process.env.NODE_ENV !== 'production') {
  initializeDatabase().catch(console.error);
}

export {
  sequelize,
  initializeDatabase,
  User,
  Testimonial,
  Category,
  Event,
  Image,
  Location,
  EventCategory,
  Blog,
  Gallery,
  ImageGallery,
  Subscriber,
  Newsletter,
  Organization,
  Certificate,
  CertificateRecipient,
};
