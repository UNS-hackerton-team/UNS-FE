import { useEffect, type ReactNode } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Invitation from './pages/Invitation';
import Dashboard from './pages/Dashboard';
import { useAppStore } from './store/appStore';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/onboarding" replace />;
}

function App() {
  const bootstrap = useAppStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/invite/:inviteCode" element={<Invitation />} />
        <Route path="/invitation/:inviteCode" element={<Invitation />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
