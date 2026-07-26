import React, { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { fetchYears, fetchSemesters } from '../../api/subjectsApi';
import {
  fetchAdminSubjects,
  createAdminSubject,
  updateAdminSubject,
  deleteAdminSubject
} from '../../api/adminApi';

export default function AdminSubjectsPage() {
  const toast = useToast();
  const { data: subjects, loading, error, reload } = useFetch(fetchAdminSubjects, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ yearId: '', semesterId: '', name: '', icon: 'menu_book', color: 'primary' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(function () {
    fetchYears().then(setYears).catch(function () {});
  }, []);

  useEffect(
    function () {
      if (form.yearId) {
        fetchSemesters(form.yearId)
          .then(function (data) {
            setSemesters(data.semesters);
          })
          .catch(function () {});
      } else {
        setSemesters([]);
      }
    },
    [form.yearId]
  );

  function openCreate() {
    setEditingSubject(null);
    setForm({ yearId: '', semesterId: '', name: '', icon: 'menu_book', color: 'primary' });
    setModalOpen(true);
  }

  function openEdit(subject) {
    setEditingSubject(subject);
    setForm({ yearId: '', semesterId: subject.semester_id, name: subject.name, icon: subject.icon, color: subject.color });
    setModalOpen(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(function (prev) {
      return Object.assign({}, prev, { [name]: value });
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const action = editingSubject
      ? updateAdminSubject(editingSubject.id, { name: form.name, icon: form.icon, color: form.color })
      : createAdminSubject({ semesterId: form.semesterId, name: form.name, icon: form.icon, color: form.color });

    action
      .then(function () {
        toast.success(editingSubject ? 'Subject updated' : 'Subject created');
        setModalOpen(false);
        reload();
      })
      .catch(function (err) {
        toast.error(err.message);
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

  function confirmDelete() {
    if (!subjectToDelete) {
      return;
    }
    setDeleting(true);
    deleteAdminSubject(subjectToDelete.id)
      .then(function () {
        toast.success('Subject deleted');
        setSubjectToDelete(null);
        reload();
      })
      .catch(function (err) {
        toast.error(err.message);
      })
      .finally(function () {
        setDeleting(false);
      });
  }

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">Manage Subjects</h2>
          <p className="text-body-md text-text-secondary">Create and organize subjects by semester.</p>
        </div>
        <Button icon="add_box" onClick={openCreate}>
          Add Subject
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <Skeleton type="card" count={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : subjects.length === 0 ? (
        <EmptyState icon="category" title="No subjects yet" description="Add your first subject to get started." action={<Button icon="add_box" onClick={openCreate}>Add Subject</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {subjects.map(function (subject) {
            return (
              <div key={subject.id} className="bg-white p-5 rounded-xl border border-border-subtle">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {subject.icon}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={function () {
                        openEdit(subject);
                      }}
                      className="p-1.5 text-text-muted hover:text-primary transition-colors"
                      aria-label={'Edit ' + subject.name}
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={function () {
                        setSubjectToDelete(subject);
                      }}
                      className="p-1.5 text-text-muted hover:text-error transition-colors"
                      aria-label={'Delete ' + subject.name}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
                <h3 className="font-label-md text-label-md text-text-primary">{subject.name}</h3>
                <p className="text-body-sm text-text-muted mt-1">
                  {subject.year_label} • {subject.semester_label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={function () {
          setModalOpen(false);
        }}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        footer={
          <React.Fragment>
            <Button variant="secondary" onClick={function () { setModalOpen(false); }}>
              Cancel
            </Button>
            <Button loading={submitting} onClick={handleSubmit}>
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </React.Fragment>
        }
      >
        <form className="space-y-stack-md" onSubmit={handleSubmit}>
          <Input id="subject-name" name="name" label="Subject Name" value={form.name} onChange={handleChange} required />

          {!editingSubject ? (
            <React.Fragment>
              <div>
                <label htmlFor="yearId" className="block font-label-md text-label-md text-text-primary mb-2">
                  Year
                </label>
                <select
                  id="yearId"
                  name="yearId"
                  value={form.yearId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select a year</option>
                  {years.map(function (y) {
                    return (
                      <option key={y.id} value={y.id}>
                        {y.label}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="semesterId" className="block font-label-md text-label-md text-text-primary mb-2">
                  Semester
                </label>
                <select
                  id="semesterId"
                  name="semesterId"
                  value={form.semesterId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select a semester</option>
                  {semesters.map(function (s) {
                    return (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </React.Fragment>
          ) : null}

          <div>
            <label htmlFor="icon" className="block font-label-md text-label-md text-text-primary mb-2">
              Icon (Material Symbol name)
            </label>
            <Input id="icon" name="icon" value={form.icon} onChange={handleChange} placeholder="menu_book" />
          </div>

          <div>
            <label htmlFor="color" className="block font-label-md text-label-md text-text-primary mb-2">
              Accent Color
            </label>
            <select
              id="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!subjectToDelete}
        onClose={function () {
          setSubjectToDelete(null);
        }}
        title="Delete Subject"
        footer={
          <React.Fragment>
            <Button variant="secondary" onClick={function () { setSubjectToDelete(null); }}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </React.Fragment>
        }
      >
        <p className="text-body-md text-text-secondary">
          Deleting "{subjectToDelete ? subjectToDelete.name : ''}" will also remove all notes under it. This
          cannot be undone.
        </p>
      </Modal>
    </AppShell>
  );
}
