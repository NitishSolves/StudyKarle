import React from "react";
import { Link } from "react-router-dom";
import { formatBytes } from "../../utils/formatBytes";
import { formatDate } from "../../utils/formatDate";

// Renders a set of canonical tree files as rows. Each file links to its
// node-based preview URL (`/drive/file/:nodeId`).
export default function FileList({ files }) {
  if (!files || files.length === 0) {
    return null;
  }
  return (
    <div className="space-y-3">
      {files.map(function (file) {
        return (
          <Link
            key={file.nodeId}
            to={"/drive/file/" + file.nodeId}
            className="bg-white p-5 rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-all flex items-center gap-5 group"
          >
            <div className="w-12 h-14 bg-error-container/30 rounded-lg flex flex-col items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-[24px]" aria-hidden="true">
                picture_as_pdf
              </span>
              <span className="text-[9px] font-bold text-error mt-0.5">PDF</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors truncate">
                {file.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-body-sm text-text-muted">
                  {formatBytes(file.sizeBytes)}
                </span>
                <span className="text-body-sm text-text-muted" aria-hidden="true">
                  •
                </span>
                <span className="text-body-sm text-text-muted">
                  {file.modifiedTime ? formatDate(file.modifiedTime) : "Modified date unavailable"}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-text-muted group-hover:text-primary" aria-hidden="true">
              visibility
            </span>
          </Link>
        );
      })}
    </div>
  );
}
