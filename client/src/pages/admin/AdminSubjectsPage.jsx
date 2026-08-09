import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import AppShell from "../../components/layout/AppShell";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    semesterId: "",
    yearId: "",
    icon: "menu_book",
    accentColor: "blue",
  });
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchYears();
  }, []);

  async function fetchSubjects() {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/subjects");
      setSubjects(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  async function fetchYears() {
    try {
      const res = await axiosClient.get("/years");
      setYears(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch years:", err);
    }
  }

  async function fetchSemestersByYear(yearId) {
    if (!yearId) {
      setSemesters([]);
      return;
    }
    try {
      const res = await axiosClient.get(`/years/${yearId}/semesters`);
      setSemesters(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch semesters:", err);
    }
  }

  function handleYearChange(yearId) {
    setFormData({ ...formData, yearId, semesterId: "" });
    fetchSemestersByYear(yearId);
  }

  function openCreate() {
    setEditingSubject(null);
    setFormData({
      name: "",
      semesterId: "",
      yearId: "",
      icon: "menu_book",
      accentColor: "blue",
    });
    setSemesters([]);
    setShowForm(true);
  }

  function openEdit(subject) {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      semesterId: subject.semester_id,
      yearId: subject.year_id,
      icon: subject.icon || "menu_book",
      accentColor: subject.accent_color || "blue",
    });
    fetchSemestersByYear(subject.year_id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSubject) {
        await axiosClient.patch(
          `/admin/subjects/${editingSubject.id}`,
          formData
        );
      } else {
        await axiosClient.post("/admin/subjects", formData);
      }
      setShowForm(false);
      setEditingSubject(null);
      setFormData({
        name: "",
        semesterId: "",
        yearId: "",
        icon: "menu_book",
        accentColor: "blue",
      });
      setSemesters([]);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save subject");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!subjectToDelete) return;
    try {
      await axiosClient.delete(`/admin/subjects/${subjectToDelete.id}`);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete subject");
    }
  }

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline-lg text-headline-lg text-text-primary">
          Manage Subjects
        </h1>
        <div className="flex gap-3">
          <Button onClick={openCreate} variant="primary">
            Add Subject
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border-subtle p-stack-md mb-6">
          <h3 className="text-label-md text-text-muted uppercase tracking-wider mb-4">
            {editingSubject ? "Edit Subject" : "Add Subject"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
                  placeholder="e.g., Data Structures"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Year
                </label>
                <select
                  value={formData.yearId}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
                  required
                  disabled={!!editingSubject}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Semester
                </label>
                <select
                  value={formData.semesterId}
                  onChange={(e) =>
                    setFormData({ ...formData, semesterId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
                  required
                  disabled={!formData.yearId || !!editingSubject}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Icon (Material Symbol)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
                  placeholder="menu_book"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Accent Color
                </label>
                <select
                  value={formData.accentColor}
                  onChange={(e) =>
                    setFormData({ ...formData, accentColor: e.target.value })
                  }
                  className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="red">Red</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting} variant="primary">
                {editingSubject ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingSubject(null);
                  setFormData({
                    name: "",
                    semesterId: "",
                    yearId: "",
                    icon: "menu_book",
                    accentColor: "blue",
                  });
                  setSemesters([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Skeleton type="row" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSubjects} />
      ) : subjects.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p>No subjects yet. Add your first subject above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-xl border border-border-subtle p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-2xl text-${
                      subject.accent_color || "blue"
                    }-500`}
                  >
                    {subject.icon || "menu_book"}
                  </span>
                  <div>
                    <h3 className="font-label-md text-text-primary">
                      {subject.name}
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      {subject.year_label} • {subject.semester_label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(subject)}
                    className="p-1.5 rounded-lg hover:bg-surface-high text-text-secondary"
                  >
                    <span className="material-symbols-outlined text-lg">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => setSubjectToDelete(subject)}
                    className="p-1.5 rounded-lg hover:bg-error/10 text-error"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subjectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-headline-md text-text-primary mb-2">
              Delete Subject?
            </h3>
            <p className="text-body-sm text-text-secondary mb-6">
              Deleting "{subjectToDelete.name}" will also remove all notes under
              it. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setSubjectToDelete(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
