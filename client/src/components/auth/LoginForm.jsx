  import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

export default function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(function (prev) {
      return Object.assign({}, prev, { [name]: value });
    });
  }

  function validate() {
    const next = {};
    if (!form.email) {
      next.email = 'Email is required';
    }
    if (!form.password) {
      next.password = 'Password is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    login(form)
      .then(function () {
        toast.success('Welcome back!');
        const redirectTo = (location.state && location.state.from && location.state.from.pathname) || '/dashboard';
        navigate(redirectTo, { replace: true });
      })
      .catch(function (err) {
        toast.error(err.message);
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

  return (
    <form className="space-y-stack-md" onSubmit={handleSubmit} noValidate>
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        icon="mail"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        required
      />
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="font-label-md text-label-md text-text-primary">
            Password
          </label>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          icon="lock"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" fullWidth loading={submitting}>
        Login
      </Button>
    </form>
  );
}
