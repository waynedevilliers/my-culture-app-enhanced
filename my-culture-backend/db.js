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

const sequelize = new Sequelize(process.env.DB, { logging: false });

const User = UserModel(sequelize);
const Event = EventModel(sequelize);
const Image = ImageModel(sequelize);
const Location = LocationModel(sequelize);
const Testimonial = TestimonialModel(sequelize);
const Category = CategoryModel(sequelize);
const Gallery = GalleryModel(sequelize);
const Organization = OrganizationModel(sequelize);
const Blog = BlogModel(sequelize);
const EventCategory = EventCategoryModel(sequelize);
const ImageGallery = ImageGalleryModel(sequelize);
const Subscriber = SubscriberModel(sequelize);
const Newsletter = NewsletterModel(sequelize);
const Certificate = CertificateModel(sequelize);
const CertificateRecipient = CertificateRecipientModel(sequelize);

User.hasMany(Event, { foreignKey: "userId" });
Event.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Image, { foreignKey: "userId" });
Image.belongsTo(User, { foreignKey: "userId" });

Event.belongsTo(Image, { foreignKey: "imageId" });
Image.hasMany(Event, { foreignKey: "imageId" });

Organization.belongsTo(Image, { foreignKey: "imageId" });
Image.hasMany(Organization, { foreignKey: "imageId" });

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

try {
  await sequelize.sync({ force: false });
  console.log("Sequelize database connection successfully.");
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", "Database connection failed:", error.message);
  process.exit(1);
}

export {
  sequelize,
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
