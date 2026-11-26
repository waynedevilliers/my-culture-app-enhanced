import Protected from "@/routes/Protected.jsx";
import Authorize from "@/routes/Authorize.jsx";
import AdminLayout from "@/AdminLayout.jsx";
import { DASHBOARD_ROLES } from "@/contexts/UserContext.jsx";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <Authorize roles={DASHBOARD_ROLES}>
        <AdminLayout>{children}</AdminLayout>
      </Authorize>
    </Protected>
  );
}
