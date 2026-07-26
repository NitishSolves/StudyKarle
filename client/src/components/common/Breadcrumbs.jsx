import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-body-sm text-text-muted mb-4">
      <Link to="/dashboard" className="hover:text-primary transition-colors">
        Home
      </Link>
      {items.map(function (item, index) {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              chevron_right
            </span>
            {isLast || !item.to ? (
              <span className="text-text-primary font-medium" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
