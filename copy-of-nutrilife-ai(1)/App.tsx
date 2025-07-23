import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import ProductAnalyzer from './components/ProductAnalyzer';
import LifestyleOverhaul from './components/LifestyleOverhaul';
import History from './components/History';
import Sidebar from './components/Sidebar';
import { useHistory } from './hooks/useHistory';

export type View = 'analyzer' | 'overhaul' | 'history';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('analyzer');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { history } = useHistory();

  const historyCount = history.products.length + history.overhauls.length;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        historyCount={historyCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="h-full"
              >
                {activeView === 'analyzer' && <ProductAnalyzer />}
                {activeView === 'overhaul' && <LifestyleOverhaul />}
                {activeView === 'history' && <History />}
              </motion.div>
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;