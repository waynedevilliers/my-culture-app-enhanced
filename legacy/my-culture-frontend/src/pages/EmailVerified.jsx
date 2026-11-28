import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaHome, FaSignInAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const EmailVerified = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [organizationData, setOrganizationData] = useState(null);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND || "http://localhost:3001";
        const response = await axios.get(`${backendUrl}/api/organization/verify-email/${token}`);
        
        if (response.status === 200) {
          setVerificationStatus('success');
          setOrganizationData(response.data.organization);
          setAdminData(response.data.adminUser);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/');
    // You might want to trigger the login modal here
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600">{t('emailVerification.verifying')}</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('emailVerification.failed.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('emailVerification.failed.message')}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaHome />
              {t('emailVerification.buttons.goHome')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheck className="text-3xl text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('emailVerification.success.title')}</h1>
        <p className="text-gray-600 mb-6">
          {t('emailVerification.success.message', { organizationName: organizationData?.name })}
        </p>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">{t('emailVerification.success.adminAccount.title')}</h3>
          <p className="text-sm text-blue-700">
            {t('emailVerification.success.adminAccount.description')}
          </p>
          <p className="text-sm text-blue-800 font-mono mt-1">
            {adminData?.email}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {t('emailVerification.success.adminAccount.instructions')}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoToLogin}
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaSignInAlt />
            {t('emailVerification.buttons.goToLogin')}
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaHome />
            {t('emailVerification.buttons.goHome')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerified;