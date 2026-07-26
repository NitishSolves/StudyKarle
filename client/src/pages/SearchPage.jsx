import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import NoteListItem from '../components/notes/NoteListItem';
import Pagination from '../components/common/Pagination';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Input from '../components/common/Input';
import useDebounce from '../hooks/useDebounce';
import { searchNotes } from '../api/notesApi';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(initialQuery);
  const debouncedQuery = useDebounce(inputValue, 400);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(
    function () {
      if (!debouncedQuery.trim()) {
        setResult(null);
        setSearchParams({});
        return;
      }
      setSearchParams({ q: debouncedQuery });
      setPage(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [debouncedQuery]
  );

  useEffect(
    function () {
      const query = debouncedQuery.trim();
      if (!query) {
        return;
      }
      setLoading(true);
      setError(null);
      searchNotes(query, page)
        .then(setResult)
        .catch(function (err) {
          setError(err.message);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [debouncedQuery, page]
  );

  return (
    <AppShell>
      <div className="mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">
          Search Notes
        </h2>
        <p className="text-body-md text-text-secondary">
          Search across all notes, subjects and topics.
        </p>
      </div>

      <Input
        id="search-input"
        icon="search"
        placeholder="Search notes, subjects..."
        value={inputValue}
        onChange={function (e) {
          setInputValue(e.target.value);
        }}
        className="max-w-xl mb-stack-lg"
      />

      {!debouncedQuery.trim() ? (
        <EmptyState
          icon="search"
          title="Start typing to search"
          description="Find notes by title, subject, or description."
        />
      ) : loading ? (
        <Skeleton type="row" count={4} />
      ) : error ? (
        <ErrorState message={error} />
      ) : !result || !result.notes ? (
        <Skeleton type="row" count={4} />
      ) : result.notes.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="No results found"
          description={
            'No notes matched "' +
            debouncedQuery +
            '". Try a different search term.'
          }
        />
      ) : (
        <React.Fragment>
          <p className="text-body-md text-text-secondary mb-4">
            {result.meta.total} results found for "{debouncedQuery}"
          </p>
          <div className="space-y-4">
            {result.notes.map(function (note) {
              return <NoteListItem key={note.id} note={note} />;
            })}
          </div>
          <Pagination
            page={page}
            totalPages={result.meta.totalPages}
            onChange={setPage}
          />
        </React.Fragment>
      )}
    </AppShell>
  );
}
