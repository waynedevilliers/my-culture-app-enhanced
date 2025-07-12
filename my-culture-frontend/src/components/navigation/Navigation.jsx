import { useUser } from "../../contexts/UserContext.jsx";
import { NavLink } from "react-router-dom";
import {
  FaArrowRightFromBracket, FaArrowRightToBracket,
  FaHouseChimney,
  FaHouseChimneyUser,
  FaUserGroup,
  FaUser, FaBarsStaggered, FaFire, FaHandshake,
} from 'react-icons/fa6';
import { useState } from 'react';

const Navigation = () => {
  const { user, logout, initials } = useUser();
  const [isChecked, setIsChecked] = useState(false);

  const drawerHandler = () => {
    setIsChecked(!isChecked);
  }

  const handleDropDown = () => {
    const element = document.activeElement;
    if (element) {
      element?.blur();
    }
  }

  return (
    <nav className="w-full border-b-4 border-primary">
    <section className="drawer max-w-screen-xl mx-auto">
      <input id="page-drawer" checked={isChecked} onChange={drawerHandler} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex justify-between items-center m-4">
        <NavLink to="/" className={({ isActive }) => isActive ? "" : ""}>
          <img src="/logoNew/MB_Sparkasse.png" alt="culture academy" className="h-14 sm:h-16 md:h-20 w-auto mb-5" />
        </NavLink>
        <label htmlFor="page-drawer" className="btn btn-ghost drawer-button lg:hidden text-secondary">
          <FaBarsStaggered className="text-2xl" />
        </label>
        <ul className="hidden lg:flex flex-row gap-6 items-center font-semibold text-2xl text-secondary">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "text-primary" : ""}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/organizations" className={({ isActive }) => isActive ? "text-primary" : ""}>Organizations</NavLink>
          </li>
          {/*<li>*/}
          {/*  <NavLink to="/blog" className={({ isActive }) => isActive ? "text-primary" : ""}>Blog</NavLink>*/}
          {/*</li>*/}
          {user ? (
            <>
              <li>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-primary btn-circle avatar text-2xl font-bold">
                    {initials && (initials)}
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-neutral border-primary border-4 z-[1] mt-3 w-52 p-2 shadow">
                    <li>
                      <NavLink to="/profile" onClick={handleDropDown} className={({ isActive }) => isActive ? "text-primary" : ""}>Profile</NavLink>
                    </li>
                    {user.role === "admin" && (
                      <li>
                        <NavLink to="/dashboard/home" className={({ isActive }) => isActive ? "" : ""}>Dashboard</NavLink>
                      </li>
                    )}
                    <li>
                      <button onClick={logout} className="">Logout</button>
                    </li>
                  </ul>
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => document.getElementById("login-form")?.showModal()}>
                  Log In
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="drawer-side">
        <label htmlFor="page-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu gap-4 w-64 bg-neutral text-gray-200 min-h-full sm:w-80 p-4 relative">
          <div className="absolute h-[98%] w-[92%] right-2 top-2 border-r-4 border-t-4 border-primary"></div>
          <li className="self-center">
            <NavLink to="/" onClick={drawerHandler} className={({ isActive }) => isActive ? "" : ""}> <img
              src="/logoNew/MB_Sparkasse.png"
              alt="Musik Leben e.V. Logo"
              className="h-10 sm:h-16 w-auto mb-5"
            /> </NavLink>
          </li>
          <li>
            <NavLink to="/" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
              <span className="text-2xl"><FaHouseChimney /></span>Home</NavLink>
          </li>
          {/*<li>*/}
          {/*  <NavLink to="/events" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>*/}
          {/*    <span className="text-2xl"><FaMusic /></span>Events</NavLink>*/}
          {/*</li>*/}
          <li>
            <NavLink to="/gallery" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
              <span className="text-2xl"><FaFire /></span>Organisations</NavLink>
          </li>
          <li>
            <NavLink to="/about-us" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
              <span className="text-2xl"><FaUserGroup /></span>About Us</NavLink>
          </li>
          <li>
            <NavLink to="/join-us" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
              <span className="text-2xl"><FaHandshake /></span>Take part</NavLink>
          </li>
          {/*<li>*/}
          {/*  <NavLink to="/blog" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>*/}
          {/*    <span className="text-2xl"><FaNewspaper /></span>Blog</NavLink>*/}
          {/*</li>*/}
          <div className="divider divider-primary"></div>
          {user ? (
            <>
              <li>
                <NavLink to="/profile" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
                  <span className="text-2xl"><FaUser /></span>Profile</NavLink>
              </li>
              {user.role === "admin" && (
                <li>
                  <NavLink to="/dashboard/home" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>
                    <span className="text-2xl"><FaHouseChimneyUser /></span>Dashboard</NavLink>
                </li>
              )}
              <li>
                <button onClick={logout}><span className="text-2xl"><FaArrowRightFromBracket /></span>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => document.getElementById("login-form")?.showModal()}>
                  <span className="text-2xl"><FaArrowRightToBracket /></span>Log In
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </section>
    </nav>
  );
};

export default Navigation;
