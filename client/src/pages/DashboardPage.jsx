import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import YearCard from "../components/notes/YearCard";
import NoteCard from "../components/notes/NoteCard";
import Skeleton from "../components/common/Skeleton";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { fetchYears } from "../api/subjectsApi";
import { fetchRecentNotes } from "../api/notesApi";

function Icon({ name, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined leading-none ${className}`}
    >
      {name}
    </span>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const yearsState = useFetch(fetchYears, []);
  const [notes, setNotes] = useState(null);
  const [notesError, setNotesError] = useState(null);

  useEffect(function () {
    fetchRecentNotes(6)
      .then(setNotes)
      .catch(function (err) {
        setNotesError(err.message);
      });
  }, []);

  return (
    <AppShell>
      {/* Welcome Header */}
      <section className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-border-subtle bg-white p-7 sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-secondary/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary">
              {getGreeting()}
            </p>
            <h1 className="mt-2 font-headline-xl text-headline-xl text-text-primary">
              Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="mt-2 text-body-lg text-text-secondary">
              What will you learn today?
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-border-subtle bg-white px-5 py-2.5 font-label-md text-label-md text-text-primary shadow-sm transition-all hover:bg-surface-container-low sm:self-auto"
          >
            <Icon name="search" className="text-[18px]" />
            Search resources
          </Link>
        </div>
      </section>

      {/* Browse by Year */}
      <section className="mb-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary">
              Browse by Year
            </h2>
            <p className="mt-1 text-body-md text-text-secondary">
              Select a year to explore semesters and subjects.
            </p>
          </div>
        </div>

        {yearsState.loading ? (
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton type="card" count={4} />
          </div>
        ) : yearsState.error ? (
          <ErrorState message={yearsState.error} onRetry={yearsState.reload} />
        ) : yearsState.data.length === 0 ? (
          <EmptyState
            icon="calendar_month"
            title="No years available"
            description="Academic years haven't been set up yet. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {yearsState.data.map(function (year, index) {
              return <YearCard key={year.id} year={year} index={index} />;
            })}
          </div>
        )}
      </section>

     
    </AppShell>
  );
}
