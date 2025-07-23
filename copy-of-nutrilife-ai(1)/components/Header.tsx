import React from 'react';
import { MenuIcon } from './common/Icon';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 lg:hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/60">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-200/60 transition-colors">
          <span className="sr-only">Open menu</span>
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-md shadow-sky-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 font-manrope">
                NutriLife <span className="text-sky-500">AI</span>
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;