import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import ProductAnalyzer from './components/ProductAnalyzer';
import LifestyleOverhaul from './components/LifestyleOverhaul';
import History from './components/History';
import Sidebar from './components/Sidebar';
import { useHistory } from './hooks/useHistory';
import type { View } from './types';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { history } = useHistory();

  const historyCount = history.products.length + history.overhauls.length;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={currentView}
        setActiveView={setCurrentView}
        historyCount={historyCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="h-full"
              >
                {currentView === 'dashboard' && <Dashboard setActiveView={setCurrentView} />}
                {currentView === 'analyzer' && <ProductAnalyzer />}
                {currentView === 'overhaul' && <LifestyleOverhaul />}
                {currentView === 'history' && <History />}
              </motion.div>
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    return (
      <AnimatePresence mode="wait">
          <motion.div
              key={user ? 'app' : 'auth'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
          >
              {user ? <MainApp /> : <Auth />}
          </motion.div>
      </AnimatePresence>
    );
};

export default App;