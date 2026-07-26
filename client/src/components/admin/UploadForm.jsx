import React, { useEffect, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { fetchAdminSubjects, uploadNote } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

export default function UploadForm({ onUploaded }) {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', status: 'published' });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(function () {
    fetchAdminSubjects()
      .then(setSubjects)
      .catch(function () {
        toast.error('Failed to load subjects');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(function (prev) {
      return Object.assign({}, prev, { [name]: value });
    });
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      setErrors(function (prev) {
        return Object.assign({}, prev, { file: 'Only PDF files are supported' });
      });
      setFile(null);
      return;
    }
    setErrors(function (prev) {
      return Object.assign({}, prev, { file: undefined });
    });
    setFile(selected || null);
  }

  function validate() {
    const next = {};
    if (!form.title || form.title.trim().length < 2) {
      next.title = 'Title must be at least 2 characters';
    }
    if (!form.subjectId) {
      next.subjectId = 'Please select a subject';
    }
    if (!file) {
      next.file = 'A PDF file is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('subjectId', form.subjectId);
    formData.append('status', form.status);
    formData.append('file', file);

    setSubmitting(true);
    uploadNote(formData)
      .then(function (note) {
        toast.success('Note uploaded successfully');
        setForm({ title: '', description: '', subjectId: '', status: 'published' });
        setFile(null);
        e.target.reset();
        if (onUploaded) {
          onUploaded(note);
        }
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
        id="title"
        name="title"
        label="Note Title"
        placeholder="Unit 3 - Stacks and Queues"
        value={form.title}
        onChange={handleChange}
        error={errors.title}
        required
      />

      <div>
        <label htmlFor="description" className="block font-label-md text-label-md text-text-primary mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Brief description of the note contents"
          className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md resize-none"
        />
      </div>

      <div>
        <label htmlFor="subjectId" className="block font-label-md text-label-md text-text-primary mb-2">
          Subject
        </label>
        <select
          id="subjectId"
          name="subjectId"
          value={form.subjectId}
          onChange={handleChange}
          className={
            'w-full px-4 py-2.5 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md ' +
            (errors.subjectId ? 'border-error' : 'border-border-subtle')
          }
        >
          <option value="">Select a subject</option>
          {subjects.map(function (s) {
            return (
              <option key={s.id} value={s.id}>
                {s.year_label} - {s.semester_label} - {s.name}
              </option>
            );
          })}
        </select>
        {errors.subjectId ? <p className="mt-1.5 text-body-sm text-error">{errors.subjectId}</p> : null}
      </div>

      <div>
        <label htmlFor="status" className="block font-label-md text-label-md text-text-primary mb-2">
          Visibility
        </label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div>
        <label htmlFor="file" className="block font-label-md text-label-md text-text-primary mb-2">
          PDF File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full text-body-sm text-text-secondary file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20 cursor-pointer"
        />
        {errors.file ? <p className="mt-1.5 text-body-sm text-error">{errors.file}</p> : null}
        <p className="mt-1.5 text-body-sm text-text-muted">Maximum file size: 25MB</p>
      </div>

      <Button type="submit" icon="cloud_upload" loading={submitting} fullWidth>
        Upload Note
      </Button>
    </form>
  );
}
