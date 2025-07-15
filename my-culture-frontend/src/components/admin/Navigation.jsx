import { NavLink } from "react-router-dom";
import { useUser } from "../../contexts/UserContext.jsx";
import { useTranslation } from "react-i18next";
import {
  FaArrowRightFromBracket,
  FaCalendarCheck,
  FaHouseChimney,
  FaHouseChimneyUser,
  FaMapLocationDot,
  FaPlus,
  FaUserGroup,
  FaChartBar,
  FaInfo,
  FaMusic,
  FaImages, FaBarsStaggered, FaNewspaper, FaUserPen,
} from "react-icons/fa6";
import { useState } from "react";

const Navigation = () => {
  const { logout } = useUser();
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  const drawerHandler = () => {
    setIsChecked(!isChecked);
  };

  return (
    <nav className="drawer max-w-screen-xl">
      <input id="dashboard-drawer" checked={isChecked} onChange={drawerHandler} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex justify-end items-center m-4">
        <label htmlFor="dashboard-drawer" className="btn btn-ghost drawer-button lg:hidden">
          <FaBarsStaggered className="text-2xl" /> </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu gap-4 w-64 bg-base-100 text-base-content min-h-full sm:w-80 p-4 relative">
          <div className="absolute h-[98%] w-[92%] right-2 top-2 border-r-2 border-t-2 border-gray-300"></div>
          <li className="self-center">
            <NavLink to="/" onClick={drawerHandler}>
              <img src="/logo/Musikleben_Logo.png" alt="Musikleben Logo" className="h-10 sm:h-16 w-auto mb-5" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/home" onClick={drawerHandler} className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaHouseChimneyUser />
              </span> {t('admin.dashboard')} </NavLink>
          </li>
          <li>
            <details>
              <summary>
                <span className="text-2xl">
                  <FaMusic />
                </span> {t('admin.navigation.events')}
              </summary>
              <ul className="flex flex-col gap-4 mt-4">
                <li>
                  <NavLink to="/dashboard/events" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl">
                      <FaChartBar />
                    </span> {t('admin.navigation.overview')} </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/new-event" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl">
                      <FaPlus />
                    </span> {t('admin.navigation.newEvent')} </NavLink>
                </li>
                {/*<li>
                  <NavLink to="/dashboard/calendar" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : "" } >
                    <span className="text-2xl">
                      <FaCalendarCheck />
                    </span>
                    Kalendar
                  </NavLink>
                </li>*/}
                <li>
                  <NavLink to="/dashboard/locations" onClick={drawerHandler} className={({ isActive }) => (isActive ? "text-primary" : "")}>
                    <span className="text-2xl">
                      <FaMapLocationDot />
                    </span> {t('admin.navigation.locations')} </NavLink>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <NavLink to="/dashboard/users" onClick={drawerHandler} className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaUserGroup />
              </span> {t('admin.navigation.users')} </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/subscribers" onClick={drawerHandler} className={({ isActive }) => (isActive ? "text-primary" : "")}>
              <span className="text-2xl">
                <FaUserPen />
              </span> {t('admin.navigation.subscribers')} </NavLink>
          </li>
          <li>
            <details>
              <summary>
              <span className="text-2xl">
                <FaNewspaper />
              </span> {t('admin.navigation.newsletter')}
              </summary>
              <ul className="flex flex-col gap-4 mt-4">
                <li>
                  <NavLink
                    to="/dashboard/newsletter"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? "text-primary" : ""
                    }
                  >
                  <span className="text-2xl">
                    <FaChartBar />
                  </span> {t('admin.navigation.overview')} </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/new-newsletter"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? "text-primary" : ""
                    }
                  >
                    <span className="text-2xl">
                      <FaPlus />
                    </span> {t('admin.navigation.newNewsletter')} </NavLink>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span className="text-2xl">
                  <FaImages />
                </span> {t('admin.navigation.gallery')}
              </summary>
              <ul className="flex flex-col gap-4 mt-4">
                <li>
                  <NavLink
                    to="/dashboard/gallery"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? "text-primary" : ""
                    }
                  >
                    <span className="text-2xl">
                      <FaChartBar />
                    </span> {t('admin.navigation.overview')} </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/new-gallery"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? "text-primary" : ""
                    }
                  >
                    <span className="text-2xl">
                      <FaPlus />
                    </span> {t('admin.navigation.newGallery')} </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/images"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? "text-primary" : ""
                    }
                  >
                    <span className="text-2xl">
                      <FaImages />
                    </span> {t('admin.navigation.images')} </NavLink>
                </li>
              </ul>
            </details>
          </li>
          <div className="divider"></div>
          <li>
            <NavLink
              to="/dashboard/help"
              onClick={drawerHandler}
              className={({ isActive }) => (isActive ? "text-primary" : "")}
            >
              <span className="text-2xl">
                <FaInfo />
              </span> {t('admin.navigation.help')} </NavLink>
          </li>
          <li>
            <NavLink
              to="/"
              onClick={drawerHandler}
              className={({ isActive }) => (isActive ? "text-primary" : "")}
            >
              <span className="text-2xl">
                <FaHouseChimney />
              </span> {t('admin.navigation.homepage')} </NavLink>
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

export default Navigation;