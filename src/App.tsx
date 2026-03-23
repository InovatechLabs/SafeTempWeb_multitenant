import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/auth/authContext';
import AuthenticatedRoute from './contexts/auth/AuthenticatedContext';
import { Toaster } from 'sonner';
import MobileDeviceAlert from './components/mobileAlert/MobileDeviceAlert';

const Home           = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login          = lazy(() => import('./pages/auth/Login'));
const Register       = lazy(() => import('./pages/auth/Register'));
const Dashboard      = lazy(() => import('./pages/dashboard/Dashboard'));
const ReportsPage    = lazy(() => import('./pages/reports/ReportsPage'));
const HistoryPage    = lazy(() => import('./pages/history/HistoryPage'));
const ComparisonPage = lazy(() => import('./pages/comparison/ComparisonPage'));
const RecoverPassword = lazy(() => import('./pages/recoverPassword/recoverPassword'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Carregando...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <Router>
        <MobileDeviceAlert />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/home" element={<Home />} />

            <Route path="/login" element={
              <AuthenticatedRoute>
                <Login />
              </AuthenticatedRoute>
            } />

            <Route path="/register" element={
              <AuthenticatedRoute>
                <Register />
              </AuthenticatedRoute>
            } />

            <Route path="/dashboard"             element={<Dashboard />} />
            <Route path="/historico/relatorios"  element={<ReportsPage />} />
            <Route path="/historico"             element={<HistoryPage />} />
            <Route path="/historico/comparar"    element={<ComparisonPage />} />
            <Route path="/recover"               element={<RecoverPassword />} />
            <Route path="/recover/:token"        element={<RecoverPassword />} />
            <Route path="*"                      element={<Home />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;