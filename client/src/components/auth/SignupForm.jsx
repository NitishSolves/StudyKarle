import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

export default function SignupForm() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
    if (!form.name || form.name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters';
    }
    if (!form.email) {
      next.email = 'Email is required';
    }
    if (!form.password || form.password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(form.password)) {
      next.password = 'Password must contain at least one number';
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
    signup(form)
      .then(function () {
        toast.success('Account created. Welcome to StudyKarle!');
        navigate('/dashboard', { replace: true });
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
        id="name"
        name="name"
        type="text"
        label="Full Name"
        icon="person"
        placeholder="Nitish Kumar"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        autoComplete="name"
        required
      />
      <Input
        id="signup-email"
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
      <Input
        id="signup-password"
        name="password"
        type="password"
        label="Password"
        icon="lock"
        placeholder="Create a strong password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
        required
      />
      <Button type="submit" fullWidth loading={submitting}>
        Create Account
      </Button>
    </form>
  );
}
