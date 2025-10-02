import { ReactNode, useState } from 'react';
import Navbar from './Navbar';
import CreateIdentityModal from './AddIdentityModal';
import { ToastContainer } from './Toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar onCreateClick={() => setShowCreateModal(true)} />
      
      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Create Identity Modal */}
      {showCreateModal && (
        <CreateIdentityModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Layout;
