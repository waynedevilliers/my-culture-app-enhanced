import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaBuilding, 
  FaUsers, 
  FaCertificate, 
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaCheck,
  FaArrowRight,
  FaStar,
  FaHandshake
} from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";

const JoinUs = () => {
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    contactPerson: "",
    location: "",
    establishedYear: "",
    memberCount: "",
    programs: "",
    goals: "",
    additionalInfo: ""
  });
  const [loading, setLoading] = useState(false);

  const organizationTypes = [
    "Cultural Heritage Center",
    "Arts & Crafts Organization", 
    "Music Academy",
    "Dance Studio",
    "Theater Group",
    "Community Center",
    "Educational Institution",
    "Youth Organization",
    "Religious Organization",
    "Sports Club",
    "Language School",
    "Other"
  ];

  const benefits = [
    {
      icon: FaCertificate,
      title: "Digital Certificates",
      description: "Issue beautiful, professional certificates to recognize achievements and participation"
    },
    {
      icon: FaUsers,
      title: "Community Network",
      description: "Connect with other cultural organizations across Germany and beyond"
    },
    {
      icon: FaGlobe,
      title: "Online Presence",
      description: "Get featured on our platform with your own dedicated organization page"
    },
    {
      icon: FaHandshake,
      title: "Partnership Opportunities",
      description: "Collaborate with other organizations on events and cultural initiatives"
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll just show a success message
      // In a real implementation, you'd send this to a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Application submitted successfully! We'll contact you within 2-3 business days.");
      
      // Reset form
      setFormData({
        organizationName: "",
        organizationType: "",
        description: "",
        website: "",
        email: "",
        phone: "",
        contactPerson: "",
        location: "",
        establishedYear: "",
        memberCount: "",
        programs: "",
        goals: "",
        additionalInfo: ""
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative scroll-mt-24 pt-24">
      <div className="max-w-7xl mx-auto pt-24 pb-16 min-h-screen">
        {/* Hero Section */}
        <section aria-labelledby="hero-title">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 id="hero-title" className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Join Our
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-3">
              Cultural Community
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Become part of Germany's leading platform for cultural
            organizations. Connect, collaborate, and celebrate achievements
            together.
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaBuilding className="text-primary" />
              <span>50+ Organizations</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCertificate className="text-secondary" />
              <span>1000+ Certificates Issued</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-primary" />
              <span>Growing Community</span>
            </div>
          </div>
        </motion.div>
        </section>

        {/* Benefits Section */}
        <section aria-labelledby="benefits-title">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 id="benefits-title" className="text-3xl font-bold text-center text-gray-800 mb-12">
            What You Get as a Member
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <benefit.icon className="text-3xl text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </section>

        {/* Application Form */}
        <section aria-labelledby="application-title">
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 id="application-title" className="text-3xl font-bold text-gray-800 mb-4">
              Organization Application Form
            </h2>
            <p className="text-gray-600">
              Fill out this form to join our cultural community platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your organization name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Type *
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select organization type</option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your organization's mission, activities, and goals..."
              />
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Primary contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@yourorganization.de"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+49 xxx xxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://yourorganization.de"
                />
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="City, Germany"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  min="1900"
                  max="2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Member Count
                </label>
                <input
                  type="text"
                  name="memberCount"
                  value={formData.memberCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="50-100 members"
                />
              </div>
            </div>

            {/* Programs and Goals */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Programs & Activities
              </label>
              <textarea
                name="programs"
                value={formData.programs}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your current programs, workshops, events, or activities..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Goals for Joining Our Platform
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="What do you hope to achieve by joining our platform?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        </section>

        {/* Process Timeline */}
        <section aria-labelledby="process-title">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 id="process-title" className="text-3xl font-bold text-gray-800 mb-12">
            Application Process
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Submit Application
              </h3>
              <p className="text-gray-600">
                Fill out the form with your organization details
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Review Process
              </h3>
              <p className="text-gray-600">
                We review your application within 2-3 business days
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome Aboard
              </h3>
              <p className="text-gray-600">
                Get access to your dashboard and start issuing certificates
              </p>
            </div>
          </div>
        </motion.div>
        </section>
      </div>
    </main>
  );
};

export default JoinUs;