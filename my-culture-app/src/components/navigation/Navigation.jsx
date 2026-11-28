'use client';

import { useUser, DASHBOARD_ROLES } from '../../contexts/UserContext.jsx';
import { NavLink } from '@/lib/router';
import { useTranslation } from 'react-i18next';
import {
  FaArrowRightFromBracket,
  FaArrowRightToBracket,
  FaHouseChimney,
  FaHouseChimneyUser,
  FaUser,
  FaBarsStaggered,
  FaFire,
  FaHandshake,
} from 'react-icons/fa6';
import { useEffect, useRef, useState } from 'react';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';

const Navigation = () => {
  const { user, logout, initials } = useUser();
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const logoRef = useRef(null);
  const [compact, setCompact] = useState(false);

  // Show the small logo in the bar while the big one is out of view.
  useEffect(() => {
    const element = logoRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setCompact(!entry.isIntersecting)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const drawerHandler = () => {
    setIsChecked(!isChecked);
  };

  const handleDropDown = () => {
    const element = document.activeElement;
    if (element) {
      element?.blur();
    }
  };

  return (
    <>
      {/* The big logo sits centred above the menu and scrolls away. */}
      <div ref={logoRef} className="flex justify-center px-4 pt-6 pb-2">
        <NavLink to="/" aria-label={t('nav.home')}>
          <img
            src="/logo/grow.png"
            alt="grow"
            className="h-16 sm:h-20 md:h-24 w-auto"
          />
        </NavLink>
      </div>

      {/* The menu bar sticks to the top of the window. Once the big logo has
          scrolled out of view, a small logo slides in on the left. */}
      <header className="sticky top-0 z-50 bg-base-100 px-4">
        <nav className="w-full max-w-screen-xl mx-auto border-b-4 border-primary">
          <section className="drawer">
            <input
              id="page-drawer"
              aria-label="Menü"
              checked={isChecked}
              onChange={drawerHandler}
              type="checkbox"
              className="drawer-toggle"
            />
            <div className="drawer-content relative flex justify-end lg:justify-center items-center min-h-16 py-3">
              <NavLink
                to="/"
                inert={!compact}
                data-testid="compact-logo"
                className={`absolute left-0 transition-all duration-300 motion-reduce:transition-none ${
                  compact
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-12 pointer-events-none'
                }`}
              >
                <img src="/logo/grow.png" alt="grow" className="h-9 w-auto" />
              </NavLink>
              <label
                htmlFor="page-drawer"
                className="btn btn-ghost drawer-button lg:hidden text-secondary"
              >
                <FaBarsStaggered className="text-2xl" />
              </label>
              <ul className="hidden lg:flex flex-row gap-6 items-center font-semibold text-2xl text-secondary">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : ''
                    }
                  >
                    {t('nav.home')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/organizations"
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : ''
                    }
                  >
                    {t('nav.organizations')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/join-us"
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : ''
                    }
                  >
                    {t('nav.joinUs')}
                  </NavLink>
                </li>
                <li>
                  <LanguageSwitcher />
                </li>
                {/*<li>*/}
                {/*  <NavLink to="/blog" className={({ isActive }) => isActive ? "text-primary" : ""}>Blog</NavLink>*/}
                {/*</li>*/}
                {user ? (
                  <>
                    <li>
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-primary btn-circle avatar text-2xl font-bold"
                        >
                          {initials && initials}
                        </div>
                        <ul
                          tabIndex={0}
                          className="menu menu-sm dropdown-content bg-neutral border-primary border-4 z-[1] mt-3 w-52 p-2 shadow"
                        >
                          <li>
                            <NavLink
                              to="/profile"
                              onClick={handleDropDown}
                              className={({ isActive }) =>
                                isActive ? 'text-primary' : ''
                              }
                            >
                              {t('nav.profile')}
                            </NavLink>
                          </li>
                          {DASHBOARD_ROLES.includes(user.role) && (
                            <li>
                              <NavLink
                                to="/dashboard/home"
                                className={({ isActive }) =>
                                  isActive ? '' : ''
                                }
                              >
                                {t('nav.dashboard')}
                              </NavLink>
                            </li>
                          )}
                          <li>
                            <button onClick={logout} className="">
                              {t('nav.logout')}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        onClick={() =>
                          document.getElementById('login-form')?.showModal()
                        }
                        aria-label={t('nav.login')}
                      >
                        {t('nav.login')}
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="page-drawer"
                aria-hidden="true"
                className="drawer-overlay"
              ></label>
              {/* The orange frame is drawn with ::before, so the list only holds <li>. */}
              <ul className="menu gap-4 w-64 bg-neutral text-gray-200 min-h-full sm:w-80 p-4 relative before:content-[''] before:absolute before:h-[98%] before:w-[92%] before:right-2 before:top-2 before:border-r-4 before:border-t-4 before:border-primary">
                <li className="self-center">
                  <NavLink
                    to="/"
                    onClick={drawerHandler}
                    className={({ isActive }) => (isActive ? '' : '')}
                  >
                    {' '}
                    <img
                      src="/logo/grow.png"
                      alt="grow"
                      className="h-10 sm:h-16 w-auto mb-5"
                    />{' '}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : ''
                    }
                  >
                    <span className="text-2xl">
                      <FaHouseChimney />
                    </span>
                    {t('nav.home')}
                  </NavLink>
                </li>
                {/*<li>*/}
                {/*  <NavLink to="/events" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>*/}
                {/*    <span className="text-2xl"><FaMusic /></span>Events</NavLink>*/}
                {/*</li>*/}
                <li>
                  <NavLink
                    to="/organizations"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : ''
                    }
                  >
                    <span className="text-2xl">
                      <FaFire />
                    </span>
                    {t('nav.organizations')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/join-us"
                    onClick={drawerHandler}
                    className={({ isActive }) =>
                      isActive ? 'text-primary' : ''
                    }
                  >
                    <span className="text-2xl">
                      <FaHandshake />
                    </span>
                    {t('nav.joinUs')}
                  </NavLink>
                </li>
                <li className="mt-4">
                  <LanguageSwitcher />
                </li>
                {/*<li>*/}
                {/*  <NavLink to="/blog" onClick={drawerHandler} className={({ isActive }) => isActive ? "text-primary" : ""}>*/}
                {/*    <span className="text-2xl"><FaNewspaper /></span>Blog</NavLink>*/}
                {/*</li>*/}
                {/* Separator as <li> so the list only holds list items. bg-transparent
              and opacity-100 undo DaisyUI's style for empty menu items. */}
                <li
                  className="divider divider-primary flex-nowrap bg-transparent opacity-100"
                  aria-hidden="true"
                />
                {user ? (
                  <>
                    <li>
                      <NavLink
                        to="/profile"
                        onClick={drawerHandler}
                        className={({ isActive }) =>
                          isActive ? 'text-primary' : ''
                        }
                      >
                        <span className="text-2xl">
                          <FaUser />
                        </span>
                        {t('nav.profile')}
                      </NavLink>
                    </li>
                    {DASHBOARD_ROLES.includes(user.role) && (
                      <li>
                        <NavLink
                          to="/dashboard/home"
                          onClick={drawerHandler}
                          className={({ isActive }) =>
                            isActive ? 'text-primary' : ''
                          }
                        >
                          <span className="text-2xl">
                            <FaHouseChimneyUser />
                          </span>
                          {t('nav.dashboard')}
                        </NavLink>
                      </li>
                    )}
                    <li>
                      <button onClick={logout} aria-label={t('nav.logout')}>
                        <span className="text-2xl">
                          <FaArrowRightFromBracket />
                        </span>
                        {t('nav.logout')}
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        onClick={() =>
                          document.getElementById('login-form')?.showModal()
                        }
                        aria-label={t('nav.login')}
                      >
                        <span className="text-2xl">
                          <FaArrowRightToBracket />
                        </span>
                        {t('nav.login')}
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </section>
        </nav>
      </header>
    </>
  );
};

export default Navigation;
