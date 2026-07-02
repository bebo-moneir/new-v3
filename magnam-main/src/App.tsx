import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { RouterProvider, useRouter } from './lib/router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PageLoader } from './components/ui';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { LecturesPage } from './pages/LecturesPage';
import { SessionsPage } from './pages/SessionsPage';
import { SummariesPage } from './pages/SummariesPage';
import { ExamsPage } from './pages/ExamsPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';

function Routes() {
  const { path } = useRouter();
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const protectedRoutes = ['/lectures', '/sessions', '/summaries', '/exams', '/question-bank', '/favorites', '/notifications', '/admin'];
  const isProtected = protectedRoutes.some((r) => path.startsWith(r));

  if (isProtected && !profile) {
    return <AuthPage />;
  }

  if (path === '/login') return <AuthPage />;
  if (path === '/lectures') return <LecturesPage />;
  if (path === '/sessions') return <SessionsPage />;
  if (path === '/summaries') return <SummariesPage />;
  if (path === '/exams') return <ExamsPage />;
  if (path === '/question-bank') return <QuestionBankPage />;
  if (path === '/search') return <SearchPage />;
  if (path === '/favorites') return <FavoritesPage />;
  if (path === '/notifications') return <NotificationsPage />;
  if (path === '/admin') return <AdminPage />;

  return <HomePage />;
}

function Shell() {
  const { path } = useRouter();
  const isAuth = path === '/login';

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuth && <Navbar />}
      <main className="flex-1">
        <Routes />
      </main>
      {!isAuth && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <Shell />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
