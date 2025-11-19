import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const formatErrorMessage = (errorData) => {
  if (!errorData) {
    return 'Registration failed. Please try again.';
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  if (Array.isArray(errorData)) {
    return errorData.map(formatErrorMessage).join(' ');
  }

  if (typeof errorData === 'object') {
    const messages = Object.entries(errorData).map(([field, value]) => {
      const label = field === 'non_field_errors' ? '' : `${field.replace(/_/g, ' ')}: `;
      if (Array.isArray(value)) {
        return `${label}${value.join(' ')}`;
      }
      if (typeof value === 'string') {
        return `${label}${value}`;
      }
      return '';
    }).filter(Boolean);

    if (messages.length) {
      return messages.join(' ');
    }
  }

  return 'Registration failed. Please try again.';
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      return;
    }

    const result = await register(formData);
    if (result.success) {
      // Redirect to verify email with email passed as state
      navigate('/verify-email', { state: { email: formData.email } });
    } else {
      setError(formatErrorMessage(result.error));
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-lg w-full px-4">
        <h1 className="font-serif-heading text-4xl font-extrabold text-[#2b3349] mb-8 text-center tracking-wider">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-base font-sans-body">
              {error}
            </div>
          )}
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              minLength="8"
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full border border-[#2b3349] text-[#2b3349] px-8 py-4 text-base uppercase tracking-wider font-sans-body hover:bg-[#2b3349] hover:text-white transition-colors"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-6 text-base text-gray-600 font-sans-body">
          Already have an account?{' '}
          <Link to="/login" className="underline hover:text-[#2b3349]">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
