import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./Layout.jsx";
import Protected from "./routes/Protected.jsx";
import Profile from "./pages/Profile.jsx";
import Authorize from "./routes/Authorize.jsx";
import Organizations from "./pages/Organizations.jsx";
import OrganizationDetails from "./pages/OrganizationDetails.jsx";
import JoinUs from "./pages/JoinUs.jsx";
import EmailVerified from "./pages/EmailVerified.jsx";
import Root from "./Root.jsx";
import Impressum from "./pages/Impressum.jsx";
import Landing from "./pages/Landing.jsx";

// Lazy load admin components
const AdminLayout = lazy(() => import("./AdminLayout.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminEvents = lazy(() => import("./pages/admin/Events.jsx"));
const AdminNewEvent = lazy(() => import("./pages/admin/NewEvent.jsx"));
const AdminCalendar = lazy(() => import("./pages/admin/Calendar.jsx"));
const AdminLocations = lazy(() => import("./pages/admin/Locations.jsx"));
const AdminHelp = lazy(() => import("./pages/admin/Help.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/Users.jsx"));
const AdminNewsletter = lazy(() => import("./pages/admin/Newsletter.jsx"));
const AdminNewNewsletter = lazy(() => import("./pages/admin/NewNewsletter.jsx"));
const AdminOrganization = lazy(() => import("./pages/admin/Organizations.jsx"));
const AdminNewOrganization = lazy(() => import("./pages/admin/NewOrganization.jsx"));
const AdminCertificate = lazy(() => import("./pages/admin/Certificates.jsx"));
const AdminNewCertificate = lazy(() => import("./pages/admin/NewCertificate.jsx"));

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Root />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organization/:id" element={<OrganizationDetails />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/verify-email/:token" element={<EmailVerified />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route element={<Protected />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<Authorize roles={["admin"]} />}>
              <Route path="/dashboard" element={
                <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <AdminLayout />
                </Suspense>
              }>
                <Route path="/dashboard/home" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="/dashboard/events" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminEvents />
                  </Suspense>
                } />
                <Route path="/dashboard/organizations" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminOrganization />
                  </Suspense>
                } />
                <Route path="/dashboard/new-organization" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminNewOrganization />
                  </Suspense>
                } />
                <Route path="/dashboard/certificates" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminCertificate />
                  </Suspense>
                } />
                <Route path="/dashboard/new-certificate" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminNewCertificate />
                  </Suspense>
                } />
                <Route path="/dashboard/new-event" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminNewEvent />
                  </Suspense>
                } />
                <Route path="/dashboard/calendar" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminCalendar />
                  </Suspense>
                } />
                <Route path="/dashboard/users" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminUsers />
                  </Suspense>
                } />
                <Route path="/dashboard/locations" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminLocations />
                  </Suspense>
                } />
                <Route path="/dashboard/newsletter" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminNewsletter />
                  </Suspense>
                } />
                <Route path="/dashboard/new-newsletter" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminNewNewsletter />
                  </Suspense>
                } />
                <Route path="/dashboard/help" element={
                  <Suspense fallback={<div className="loading loading-spinner loading-md"></div>}>
                    <AdminHelp />
                  </Suspense>
                } />
              </Route>
            </Route>
          </Route>
        </Route>
      </>
    )
  );
  return <RouterProvider router={router} />;
};

export default App;
