import React from "react";

export default function PageLoader({ label }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-9 w-9 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
          aria-hidden="true"
        />
        {label ? (
          <p className="text-body-sm text-text-secondary">{label}</p>
        ) : null}
      </div>
    </div>
  );
}
