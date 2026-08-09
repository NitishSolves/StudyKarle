import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '../../utils/constants';

export default function MobileNav() {
  const { isAdmin } = useAuth();
  const items = (isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS).slice(0, 5);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-border-subtle flex justify-around items-center py-2 z-50"
      aria-label="Mobile navigation"
    >
      {items.map(function (item) {
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={function (props) {
              return (
                'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg ' +
                (props.isActive ? 'text-primary' : 'text-text-muted')
              );
            }}
          >
            {function (props) {
              return (
                <React.Fragment>
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={props.isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className={'text-[10px] ' + (props.isActive ? 'font-bold' : 'font-medium')}>
                    {item.label}
                  </span>
                </React.Fragment>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
}
