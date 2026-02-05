import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export interface NavigationBarProps {}

export function NavigationBar(_props?: NavigationBarProps) {
  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    return clsx(
      'flex items-center px-4 py-2 text-base transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
      isActive
        ? 'text-black border-b-2 border-pfeiffer-red'
        : 'text-gray-700 hover:text-pfeiffer-red'
    );
  };

  return (
    <nav
      role="navigation"
      className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-pfeiffer-red">ARGOS</span>
      </div>

      <div className="flex items-center gap-6">
        <NavLink to="/" end className={getLinkClassName}>
          Analyses
        </NavLink>
        <NavLink to="/global" className={getLinkClassName}>
          Global Analysis
        </NavLink>
        <NavLink to="/solutions" className={getLinkClassName}>
          Solutions
        </NavLink>
      </div>
    </nav>
  );
}
