import { Switch, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import AuthPage from "@/pages/auth";
import RoleSelectionPage from "@/pages/role-selection";
import DashboardPage from "@/pages/dashboard";
import MentorsPage from "@/pages/mentors";
import MentorProfilePage from "@/pages/mentor-profile";
import BuddyTimelinePage from "@/pages/buddy-timeline";
import BuddiesPage from "@/pages/buddies";
import BuddyDetailPage from "@/pages/buddy-detail";
import TasksPage from "@/pages/tasks";
import SettingsPage from "@/pages/settings";
import AnalyticsPage from "@/pages/analytics";
import ResourcesPage from "@/pages/resources";
import CurriculumPage from "@/pages/curriculum";
import CurriculumDetailsPage from "@/pages/curriculum-details";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/role-selection" component={RoleSelectionPage} />
        
        {/* Protected Routes */}
        <Route path="/" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/mentors" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MentorsPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/buddies" component={() => (
          <ProtectedRoute requiredRoles={['manager', 'mentor']}>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BuddiesPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/buddies/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BuddyDetailPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/tasks" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TasksPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/resources" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResourcesPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/curriculum" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurriculumPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/curriculum/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurriculumDetailsPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/analytics" component={() => (
          <ProtectedRoute requiredRoles={['manager', 'mentor']}>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnalyticsPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/settings" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/mentors/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MentorProfilePage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/buddies/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BuddyTimelinePage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-dvh bg-background">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
