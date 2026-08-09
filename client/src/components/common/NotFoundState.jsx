import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

// Controlled "not found" state. Used when the API reports a real 404 so the
// user never sees the generic "Something went wrong" internal-error screen.
export default function NotFoundState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-4">
        <span
          className="material-symbols-outlined text-text-muted text-[32px]"
          aria-hidden="true"
        >
          folder_off
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-text-primary mb-1">
        {title || "Not found"}
      </h3>
      <p className="text-body-sm text-text-muted max-w-sm mb-6">
        {message || "This item does not exist or is no longer available."}
      </p>
      {action ? (
        action
      ) : (
        <Link to="/dashboard">
          <Button variant="secondary" icon="dashboard">
            Go to Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
