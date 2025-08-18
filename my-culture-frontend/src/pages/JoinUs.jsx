import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
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
  FaHandshake,
  FaUserShield
} from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";

const JoinUs = () => {
  const { t } = useTranslation();
  
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
    additionalInfo: "",
    adminName: "",
    adminEmail: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

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
      title: t('joinUs.benefits.digitalCertificates.title'),
      description: t('joinUs.benefits.digitalCertificates.description')
    },
    {
      icon: FaUsers,
      title: t('joinUs.benefits.communityNetwork.title'),
      description: t('joinUs.benefits.communityNetwork.description')
    },
    {
      icon: FaGlobe,
      title: t('joinUs.benefits.onlinePresence.title'),
      description: t('joinUs.benefits.onlinePresence.description')
    },
    {
      icon: FaHandshake,
      title: t('joinUs.benefits.partnerships.title'),
      description: t('joinUs.benefits.partnerships.description')
    }
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.warning('Please select a valid image file (JPEG, JPG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('File size must be less than 10MB. Please choose a smaller file.');
        return;
      }
      
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.onerror = () => {
        toast.error('Failed to read the image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND || "http://localhost:3001";
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add logo if selected
      if (logo) {
        formDataToSend.append('logo', logo);
      }
      
      const response = await axios.post(`${backendUrl}/api/organizations/apply`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        toast.success("Application submitted successfully! Please check your email to verify your account and activate your organization.");
        
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
          additionalInfo: "",
          adminName: "",
          adminEmail: ""
        });
        
        // Reset logo
        setLogo(null);
        setLogoPreview(null);
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative scroll-mt-24 pt-24">
      <div className="max-w-7xl mx-auto pt-24 pb-16 min-h-screen px-4">
        {/* Hero Section */}
        <section aria-labelledby="hero-title">
        <motion.div
          className="text-center mb-16 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 id="hero-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto leading-tight">
            <span className="whitespace-nowrap">{t('joinUs.title')}</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('joinUs.titleHighlight')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-2">
            {t('joinUs.subtitle')}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-gray-600 px-4">
            <div className="flex items-center gap-2">
              <FaBuilding className="text-primary" />
              <span>50+ {t('joinUs.stats.organizations')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCertificate className="text-secondary" />
              <span>1000+ {t('joinUs.stats.certificates')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-primary" />
              <span>{t('joinUs.stats.community')}</span>
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
            {t('joinUs.benefits.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
          className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 md:p-12 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 id="application-title" className="text-3xl font-bold text-gray-800 mb-4">
              {t('joinUs.form.title')}
            </h2>
            <p className="text-gray-600">
              {t('joinUs.form.subtitle')}
            </p>
          </div>

          <form 
            onSubmit={handleSubmit}
            className="space-y-6" 
            autoComplete="off"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.organizationName')} *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('joinUs.form.organizationName')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.organizationType')} *
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('joinUs.form.selectType')}</option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('joinUs.form.logoOptional')}
              </label>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{t('joinUs.form.logoSelected')}</p>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        {t('joinUs.form.removeLogo')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4">
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          {t('joinUs.form.chooseLogo')}
                        </label>
                        <input
                          id="logo-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {t('joinUs.form.logoInfo')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('joinUs.form.description')} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('joinUs.form.descriptionPlaceholder')}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.contactPerson')}
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('joinUs.form.contactPerson')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@ihreorganisation.de"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.website')}
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://ihreorganisation.de"
                />
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.location')} *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('joinUs.form.locationPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.establishedYear')}
                </label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  min="1900"
                  max="2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('joinUs.form.memberCount')}
                </label>
                <input
                  type="text"
                  name="memberCount"
                  value={formData.memberCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('joinUs.form.memberCountPlaceholder')}
                />
              </div>
            </div>

            {/* Programs and Goals */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('joinUs.form.programs')}
              </label>
              <textarea
                name="programs"
                value={formData.programs}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('joinUs.form.programsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('joinUs.form.goals')}
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('joinUs.form.goalsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('joinUs.form.additionalInfo')}
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('joinUs.form.additionalInfoPlaceholder')}
              />
            </div>

            {/* Admin User Information */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-6">
                <FaUserShield className="text-2xl text-primary" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{t('joinUs.form.adminSection')}</h3>
                  <p className="text-gray-600">{t('joinUs.form.adminSectionDescription')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('joinUs.form.adminName')} *
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('joinUs.form.adminNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('joinUs.form.adminEmail')} *
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('joinUs.form.adminEmailPlaceholder')}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{t('joinUs.form.required')}:</strong> {t('joinUs.form.adminNote')}
                </p>
              </div>
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
                    <span>{t('joinUs.form.submitting')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('joinUs.form.submit')}</span>
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
            {t('joinUs.process.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('joinUs.process.step1.title')}
              </h3>
              <p className="text-gray-600">
                {t('joinUs.process.step1.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('joinUs.process.step2.title')}
              </h3>
              <p className="text-gray-600">
                {t('joinUs.process.step2.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t('joinUs.process.step3.title')}
              </h3>
              <p className="text-gray-600">
                {t('joinUs.process.step3.description')}
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