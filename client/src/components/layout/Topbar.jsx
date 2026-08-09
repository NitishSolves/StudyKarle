import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate('/search?q=' + encodeURIComponent(query.trim()));
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm flex justify-between items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3.5 w-full">
      <a
        href="/dashboard"
        className="lg:hidden flex items-center gap-2.5 shrink-0"
        aria-label="StudyKarle home"
      >
        <div className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center text-white shrink-0">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            school
          </span>
        </div>
        <span className="font-headline-md text-headline-md font-bold text-primary leading-none">
          StudyKarle
        </span>
      </a>

      <form
        onSubmit={handleSearchSubmit}
        className="hidden sm:block flex-1 max-w-xl relative"
        role="search"
      >
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]"
          aria-hidden="true"
        >
          search
        </span>
        <label htmlFor="topbar-search" className="sr-only">
          Search notes and subjects
        </label>
        <input
          id="topbar-search"
          type="search"
          value={query}
          onChange={function (e) {
            setQuery(e.target.value);
          }}
          placeholder="Search notes, subjects..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-low border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-sm transition-all"
        />
      </form>

      <a className="flex items-center gap-3 sm:gap-4 shrink-0" href="/profile">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="font-label-md text-label-md text-text-primary">
            Hi, {user ? user.name.split(" ")[0] : ""}
          </span>
          <span className="text-body-sm text-text-muted capitalize">
            {user ? user.role : ""}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold shrink-0">
          {user && user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
      </a>
    </header>
  );
}
