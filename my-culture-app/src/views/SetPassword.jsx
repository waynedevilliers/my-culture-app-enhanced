'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from '@/lib/router';

const INPUT =
  'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent';
const LABEL = 'block text-sm font-semibold text-gray-700 mb-2';

// Page behind the one-time "set your password" link sent to new
// organisation admins.
const SetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t('setPassword.mismatch'));
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND ?? ''}/api/auth/set-password`,
        { token, password }
      );
      toast.success(t('setPassword.success'));
      navigate('/');
      document.getElementById('login-form')?.showModal();
    } catch (error) {
      toast.error(error.response?.data?.message || t('setPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative scroll-mt-24">
      <div className="max-w-xl mx-auto pt-12 pb-16 min-h-screen px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          {t('setPassword.title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          {t('setPassword.intro')}
        </p>

        {token ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 space-y-6"
          >
            <div>
              <label htmlFor="new-password" className={LABEL}>
                {t('setPassword.password')} *
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT}
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('setPassword.rule')}
              </p>
            </div>
            <div>
              <label htmlFor="confirm-password" className={LABEL}>
                {t('setPassword.confirm')} *
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={INPUT}
              />
            </div>
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('setPassword.submit')}
              </button>
            </div>
          </form>
        ) : (
          <p className="p-4 bg-blue-50 rounded-lg text-blue-800 text-center">
            {t('setPassword.missingToken')}
          </p>
        )}
      </div>
    </main>
  );
};

export default SetPassword;
