import React from "react";
import { Link } from "react-router-dom";

// Renders a set of canonical tree folders as cards. Each folder links to its
// node-based URL (`/drive/folder/:nodeId`) so navigation always uses the
// stable node id, never a reconstructed path.
export default function FolderGrid({ folders }) {
  if (!folders || folders.length === 0) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
      {folders.map(function (folder) {
        return (
          <Link
            key={folder.nodeId}
            to={"/drive/folder/" + folder.nodeId}
            className="bg-white p-6 rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-all group flex flex-col gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                folder
              </span>
            </div>
            <h4 className="font-headline-md text-headline-md text-text-primary group-hover:text-primary transition-colors break-words">
              {folder.name}
            </h4>
            <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
              Open folder
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                arrow_forward
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
