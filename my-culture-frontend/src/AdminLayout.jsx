import { Outlet } from "react-router-dom";
import Header from "./sections/admin/Header.jsx";
import NavigationSidebar from "./components/admin/NavigationSidebar.jsx";

const AdminLayout = () => {
  return (
    <>
      <Header />
      <div className="flex h-screen">
        <div className="hidden lg:block w-80 h-full overflow-y-auto flex-shrink-0">
          <NavigationSidebar />
        </div>
        <div className="flex-1 h-full overflow-y-auto relative">
          <main className="relative">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;