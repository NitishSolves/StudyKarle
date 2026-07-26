import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

import PublicLayout from "./components/layout/PublicLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import BrowseYearsPage from "./pages/BrowseYearsPage";
import BrowseSemestersPage from "./pages/BrowseSemestersPage";
import BrowseSubjectsPage from "./pages/BrowseSubjectsPage";
import NotesListPage from "./pages/NotesListPage";
import NotePreviewPage from "./pages/NotePreviewPage";
import SearchPage from "./pages/SearchPage";
import SavedNotesPage from "./pages/SavedNotesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import FeaturesPage from "./pages/FeaturesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AuthLayout from "./components/layout/AuthLayout";
import AdminViewHistoryPage from "./pages/admin/AdminViewHistoryPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminUploadPage from "./pages/admin/AdminUploadPage";
import AdminNotesPage from "./pages/admin/AdminNotesPage";
import AdminSubjectsPage from "./pages/admin/AdminSubjectsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <BrowseYearsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse/:yearId"
        element={
          <ProtectedRoute>
            <BrowseSemestersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-history"
        element={
          <AdminRoute>
            <AdminViewHistoryPage />
          </AdminRoute>
        }
      />
      <Route
        path="/browse/:yearId/:semesterId"
        element={
          <ProtectedRoute>
            <BrowseSubjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects/:subjectId/notes"
        element={
          <ProtectedRoute>
            <NotesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:noteId"
        element={
          <ProtectedRoute>
            <NotePreviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <SavedNotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminOverviewPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/upload"
        element={
          <AdminRoute>
            <AdminUploadPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/notes"
        element={
          <AdminRoute>
            <AdminNotesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <AdminRoute>
            <AdminSubjectsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminAnalyticsPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
