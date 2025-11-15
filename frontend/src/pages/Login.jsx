import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.username, formData.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <h1 className="font-serif-heading text-4xl text-[#2b3349] mb-8 text-center tracking-wider">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm font-sans-body">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 px-4 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 px-4 py-2 text-sm font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full border border-[#2b3349] text-[#2b3349] px-8 py-4 text-sm uppercase tracking-wider font-sans-body hover:bg-[#2b3349] hover:text-white transition-colors"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600 font-sans-body">
          Don't have an account?{' '}
          <Link to="/register" className="underline hover:text-[#2b3349]">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
