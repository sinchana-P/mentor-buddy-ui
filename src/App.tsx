import { Switch, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import AuthPage from "@/pages/auth";
import RoleSelectionPage from "@/pages/role-selection";
import DashboardPage from "@/pages/dashboard";
import MentorsPage from "@/pages/mentors";
import ManagersPage from "@/pages/managers";
import MentorProfilePage from "@/pages/mentor-profile";
import BuddiesPage from "@/pages/buddies";
import BuddyDetailPage from "@/pages/buddy-detail";
import SettingsPage from "@/pages/settings";
import AnalyticsPage from "@/pages/analytics";
import ResourcesPage from "@/pages/resources";
import CurriculumDetailsPage from "@/pages/curriculum-details";
import CurriculumList from "@/pages/curriculum-management/CurriculumList";
import CurriculumBuilder from "@/pages/curriculum-management/CurriculumBuilder";
import CurriculumView from "@/pages/curriculum-management/CurriculumView";
import TaskManagement from "@/pages/curriculum-management/TaskManagement";
import CurriculumManagement from "@/pages/curriculum/CurriculumManagement";
import CurriculumSubmissions from "@/pages/curriculum/CurriculumSubmissions";
import CurriculumBuilderNew from "@/pages/curriculum/CurriculumBuilder";
import BuddyDashboard from "@/pages/buddy/BuddyDashboard";
import MyCurriculum from "@/pages/buddy/MyCurriculum";
import TaskDetail from "@/pages/buddy/TaskDetail";
import MentorDashboard from "@/pages/mentor/MentorDashboard";
import ReviewQueue from "@/pages/mentor/ReviewQueue";
import SubmissionReview from "@/pages/mentor/SubmissionReview";
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
        
        <Route path="/managers" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ManagersPage />
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
          <ProtectedRoute>
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

        <Route path="/curriculum/new" component={() => (
          <ProtectedRoute>
            <CurriculumBuilderNew />
          </ProtectedRoute>
        )} />

        <Route path="/curriculum/:id/submissions" component={() => (
          <ProtectedRoute>
            <CurriculumSubmissions />
          </ProtectedRoute>
        )} />

        <Route path="/curriculum/:id/edit" component={() => (
          <ProtectedRoute>
            <CurriculumBuilderNew />
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
          <ProtectedRoute>
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

        {/* Curriculum Management Routes (Manager/Mentor) */}
        <Route path="/curriculum-management" component={() => (
          <ProtectedRoute>
            <CurriculumList />
          </ProtectedRoute>
        )} />

        <Route path="/curriculum-management/create" component={() => (
          <ProtectedRoute>
            <CurriculumBuilder />
          </ProtectedRoute>
        )} />

        <Route path="/curriculum-management/:id/view" component={() => (
          <ProtectedRoute>
            <CurriculumView />
          </ProtectedRoute>
        )} />

        <Route path="/curriculum-management/:id" component={() => (
          <ProtectedRoute>
            <CurriculumBuilder />
          </ProtectedRoute>
        )} />

        <Route path="/curriculum-management/:curriculumId/week/:weekId/tasks" component={() => (
          <ProtectedRoute>
            <TaskManagement />
          </ProtectedRoute>
        )} />

        {/* Buddy Routes */}
        <Route path="/buddy/dashboard" component={() => (
          <ProtectedRoute>
            <BuddyDashboard />
          </ProtectedRoute>
        )} />

        <Route path="/buddy/curriculum" component={() => (
          <ProtectedRoute>
            <MyCurriculum />
          </ProtectedRoute>
        )} />

        <Route path="/buddy/task/:assignmentId" component={() => (
          <ProtectedRoute>
            <TaskDetail />
          </ProtectedRoute>
        )} />

        {/* Mentor Routes */}
        <Route path="/mentor/dashboard" component={() => (
          <ProtectedRoute>
            <MentorDashboard />
          </ProtectedRoute>
        )} />

        <Route path="/mentor/review-queue" component={() => (
          <ProtectedRoute>
            <ReviewQueue />
          </ProtectedRoute>
        )} />

        <Route path="/mentor/review/:submissionId" component={() => (
          <ProtectedRoute>
            <SubmissionReview />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
