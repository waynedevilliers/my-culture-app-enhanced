import { NavLink } from "react-router-dom";
import { useUser } from "../../contexts/UserContext.jsx";
import { useTranslation } from "react-i18next";
import {
  FaArrowRightFromBracket,
  FaHouseChimney,
  FaHouseChimneyUser,
  FaPlus,
  FaUserGroup,
  FaChartBar,
  FaInfo,
  FaBarsStaggered,
  FaUserPen,
  FaCertificate,
} from "react-icons/fa6";
import { RiCommunityFill } from "react-icons/ri";

import { useState } from "react";

const NavigationSidebar = () => {
  const { logout } = useUser();
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(true);

  return (
    <nav className="drawer max-w-screen-xl">
      <input id="dashboard-drawer" checked={isChecked} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex justify-end items-center m-4">
        <label htmlFor="dashboard-drawer" className="btn btn-ghost drawer-button lg:hidden">
          <FaBarsStaggered className="text-2xl" />
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay:hidden"></label>
        <ul className="menu gap-4 w-64 bg-base-100 text-base-content min-h-full sm:w-80 p-4 relative">
          <div className="absolute h-[98%] w-[92%] right-2 top-2 border-r-2 border-t-2 border-gray-300"></div>
          <li className="self-center">
            <NavLink to="/">
              <img src="/logoNew/MB_Sparkasse.png" alt="Musikleben Logo" className="h-10 sm:h-16 w-auto mb-5" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/home" className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaHouseChimneyUser />
              </span> {t('admin.dashboard')}
            </NavLink>
          </li>
          <li>
            <details>
              <summary>
                <span className="text-2xl">
                  <RiCommunityFill />
                </span> {t('admin.navigation.organizations')}
              </summary>
              <ul className="flex flex-col gap-4 mt-4">
                <li>
                  <NavLink to="/dashboard/organizations" className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl">
                      <FaChartBar />
                    </span> {t('admin.navigation.overview')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/new-organization" className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl">
                      <FaPlus />
                    </span> {t('admin.navigation.newOrganization')}
                  </NavLink>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span className="text-2xl">
                  <FaCertificate />
                </span> {t('admin.navigation.certificates')}
              </summary>
              <ul className="flex flex-col gap-4 mt-4">
                <li>
                  <NavLink to="/dashboard/certificates" className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl">
                      <FaChartBar />
                    </span> {t('admin.navigation.overview')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/new-certificate" className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl">
                      <FaPlus />
                    </span> {t('admin.navigation.createCertificate')}
                  </NavLink>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <NavLink to="/dashboard/users" className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaUserGroup />
              </span> {t('admin.navigation.users')}
            </NavLink>
          </li>
          <div className="divider"></div>
          <li>
            <NavLink to="/dashboard/help" className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaInfo />
              </span> {t('admin.navigation.help')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaHouseChimney />
              </span> {t('admin.navigation.homepage')}
            </NavLink>
          </li>
          <li>
            <button onClick={logout}>
              <span className="text-2xl">
                <FaArrowRightFromBracket />
              </span> {t('admin.navigation.logout')}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavigationSidebar;
