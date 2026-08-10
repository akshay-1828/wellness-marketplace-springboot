import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { resetPassword } from '../services/authService';

const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 11c1.104 0 2 .896 2 2v3a2 2 0 11-4 0v-3c0-1.104.896-2 2-2zm6 0V9a6 6 0 10-12 0v2m-1 0h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
    />
  </svg>
);

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    if (!token) {
      setError('Reset token is missing or invalid.');
      return false;
    }
    if (!newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setIsSubmitted(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to reset password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Set New Password" subtitle="Choose a new password for your account">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            label="New Password"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter a new password"
            error={error}
            required
            icon={LockIcon}
          />

          <Button type="submit" variant="primary" disabled={isLoading} loading={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Password updated</h3>
          <p className="text-gray-600 text-sm mb-6">Redirecting to sign in…</p>
          <Link to="/login">
            <Button variant="secondary">Go to Sign In</Button>
          </Link>
        </div>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
