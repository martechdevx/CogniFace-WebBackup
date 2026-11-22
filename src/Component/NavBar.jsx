import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiMoon, FiSettings, FiSun, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";
import styles from "./NavBar.module.css";

function NavBar() {
  const { isLoggedIn, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    const closeOnNavigation = event => {
      if (event.target instanceof Element && event.target.closest("a")) {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    const closeOnHistory = () => {
      setMenuOpen(false);
      setProfileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("popstate", closeOnHistory);
    document.addEventListener("click", closeOnNavigation, true);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("popstate", closeOnHistory);
      document.removeEventListener("click", closeOnNavigation, true);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeOnOutsideClick = event => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [profileOpen]);

  const links = [
    { to: "/", label: "Home", active: location.pathname === "/" },
    {
      to: "/enrollment",
      label: "Enrollment",
      active: location.pathname.startsWith("/enrollment"),
    },
    {
      to: "/verification",
      label: "Verification",
      active: location.pathname.startsWith("/verification"),
    },
    { to: "/ourblog", label: "Blog", active: location.pathname.startsWith("/ourblog") },
  ];

  const initials = user?.fullName
    ? user.fullName.trim().split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <header className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
      <Link to="/" className={styles.brand} aria-label="CogniFace home">
        <span className={styles.brandMark}>
          <BrandLogo className={styles.brandLogo} alt="" />
        </span>
        <span className={styles.brandName}><span>COGNI</span><b>FACE</b></span>
      </Link>

      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setMenuOpen(open => !open)}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <i /><i /><i />
      </button>

      <nav id="primary-navigation" className={styles.mobileMenu} aria-label="Main navigation">
        {links.map(link => (
          <Link
            key={link.label}
            to={link.to}
            className={`${styles.link} ${link.active ? styles.linkActive : ""}`}
            aria-current={link.active ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeButton}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
        </button>
        {isLoggedIn ? (
          <div className={styles.profileMenu} ref={profileRef}>
            <button type="button" className={styles.userChip} aria-expanded={profileOpen} onClick={() => setProfileOpen(open => !open)}>
              <span className={styles.avatar}>{initials}</span>
              <span className={styles.userName}>{user?.fullName?.split(" ")[0] || "Workspace"}</span>
              <FiChevronDown className={`${styles.profileChevron} ${profileOpen ? styles.profileChevronOpen : ""}`} />
            </button>
            {profileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileDropdownIdentity}>
                  <span className={styles.avatar}>{initials}</span>
                  <span><strong>{user?.fullName || "Your account"}</strong><small>{user?.email || "Signed-in user"}</small></span>
                </div>
                {user?.isAdmin ? (
                  <Link to="/dashboard"><FiUser /> Admin dashboard</Link>
                ) : (
                  <>
                    <Link to="/profile"><FiUser /> My Profile</Link>
                    <Link to="/settings"><FiSettings /> Settings</Link>
                  </>
                )}
                <button type="button" onClick={logout}><FiLogOut /> Log out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signup" className={styles.ctaButton}>
            Get Started <span><span className={styles.arrow}>↗</span></span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default NavBar;
