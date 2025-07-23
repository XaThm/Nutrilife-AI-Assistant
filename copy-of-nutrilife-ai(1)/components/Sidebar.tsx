import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { View } from '../App';
import { BeakerIcon, HomeIcon, HistoryIcon, XIcon } from './common/Icon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  setActiveView: (view: View) => void;
  historyCount: number;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ icon, label, isActive, onClick, badgeCount }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`relative group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200
        ${
          isActive
            ? 'text-white'
            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
        }`}
    >
      <span className="relative z-10">{icon}</span>
      <span className="ml-3 relative z-10 flex-1">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className={`relative z-10 ml-3 inline-block py-0.5 px-2 text-xs font-bold rounded-full transition-colors duration-200
            ${
              isActive
                ? 'bg-white text-sky-600'
                : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
            }`}
        >
          {badgeCount}
        </span>
      )}
      {isActive && (
        <motion.div
          layoutId="active-nav-link"
          className="absolute inset-0 bg-sky-500 rounded-lg shadow-md shadow-sky-500/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView, setActiveView, historyCount }) => {
  const handleNavClick = (view: View) => {
    setActiveView(view);
    onClose();
  };

  const navItems = [
    { id: 'analyzer', label: 'Product Analyzer', icon: <BeakerIcon className="h-5 w-5" />, count: undefined },
    { id: 'overhaul', label: 'Lifestyle Overhaul', icon: <HomeIcon className="h-5 w-5" />, count: undefined },
    { id: 'history', label: 'History', icon: <HistoryIcon className="h-5 w-5" />, count: historyCount },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 h-20 border-b border-slate-100">
             <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                 <h1 className="text-xl font-bold text-slate-800 font-manrope">
                    NutriLife <span className="text-sky-500">AI</span>
                </h1>
            </div>
             <button onClick={onClose} className="p-2 -mr-2 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden">
                <span className="sr-only">Close menu</span>
                <XIcon className="h-6 w-6" />
            </button>
        </div>
      <div className="flex-1 p-4">
        <nav className="space-y-2">
            {navItems.map(item => (
                <NavLink
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeView === item.id}
                    onClick={() => handleNavClick(item.id as View)}
                    badgeCount={item.count}
                />
            ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
              For informational purposes only. Always consult a healthcare professional for medical advice.
          </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/Tablet sidebar (overlay) */}
      <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '0' }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed inset-y-0 left-0 z-50 w-72 max-w-[calc(100%-3rem)] lg:hidden"
                >
                    <div className="relative h-full shadow-2xl">
                        {sidebarContent}
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose}
                />
            </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (static) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-72 border-r border-slate-200">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;