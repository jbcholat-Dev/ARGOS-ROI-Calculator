import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PDFExportButton } from '@/components/pdf';
import { useAppStore } from '@/stores/app-store';

export function NavigationBar() {
  const [showResetModal, setShowResetModal] = useState(false);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const navigate = useNavigate();

  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    return clsx(
      'flex items-center px-4 py-2 text-base transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
      isActive
        ? 'text-black border-b-2 border-pfeiffer-red'
        : 'text-gray-700 hover:text-pfeiffer-red'
    );
  };

  const handleResetConfirm = () => {
    clearAllData();
    setShowResetModal(false);
    navigate('/');
  };

  return (
    <>
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

        <div className="flex items-center gap-2">
          <PDFExportButton variant="compact" />
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className={clsx(
              'px-3 py-1.5 text-sm rounded',
              'text-gray-500 hover:text-pfeiffer-red hover:bg-gray-100',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
            )}
          >
            Reset All Data
          </button>
        </div>
      </nav>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset all data?"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetConfirm}>
              Reset
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure? All analyses will be permanently deleted.
        </p>
      </Modal>
    </>
  );
}
