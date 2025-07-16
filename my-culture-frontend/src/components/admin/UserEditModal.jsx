import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserEditModal = ({ user, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('admin.forms.validation.required');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('admin.forms.validation.required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('admin.forms.validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('admin.forms.validation.invalidEmail');
    }
    
    if (!formData.role) {
      newErrors.role = t('admin.forms.validation.required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND}/api/users/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success(t('admin.messages.userUpdateSuccess'));
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('admin.messages.userUpdateFailed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {t('admin.forms.editUser')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.tables.firstName')}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.firstName ? 'border-error' : ''}`}
              placeholder={t('admin.tables.firstName')}
            />
            {errors.firstName && (
              <span className="text-error text-sm">{errors.firstName}</span>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.tables.lastName')}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.lastName ? 'border-error' : ''}`}
              placeholder={t('admin.tables.lastName')}
            />
            {errors.lastName && (
              <span className="text-error text-sm">{errors.lastName}</span>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.tables.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.email ? 'border-error' : ''}`}
              placeholder={t('admin.tables.email')}
            />
            {errors.email && (
              <span className="text-error text-sm">{errors.email}</span>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.tables.access')}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`select select-bordered w-full ${errors.role ? 'border-error' : ''}`}
            >
              <option value="user">{t('admin.roles.user')}</option>
              <option value="admin">{t('admin.roles.admin')}</option>
              <option value="superAdmin">{t('admin.roles.superAdmin')}</option>
            </select>
            {errors.role && (
              <span className="text-error text-sm">{errors.role}</span>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              {t('admin.forms.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? t('admin.forms.saving') : t('admin.forms.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;