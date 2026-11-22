import { Fragment, lazy, useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  apiAdminActivity, apiAdminOverview, apiAdminUsers, apiAdminEnrollments,
  apiAdminEnrollmentFaces, apiAdminDeleteEnrollment, apiGrantAdminAccess,
  apiAdminProfile, apiDashboardStats, apiDeleteAdminUser,
  apiUpdateAdminPassword, apiUpdateAdminProfile,
  apiUserProfile, apiUpdateUserPassword, apiUpdateUserProfile, apiEnrollmentStatus,
  apiUserEnrollmentProfile,
} from "../../services/api";
import {
  FiUserPlus, FiArrowRight, FiSearch,
  FiShield, FiCheckCircle, FiActivity, FiChevronRight,
  FiAlertCircle, FiRefreshCw, FiTrash2, FiUsers, FiUserCheck,
  FiGrid, FiDatabase, FiCpu, FiKey, FiList, FiPlus, FiX,
  FiChevronDown, FiSettings, FiSave, FiLock, FiUser, FiArrowLeft, FiCamera,
  FiMail, FiImage, FiMenu, FiChevronLeft, FiLogOut, FiMoon, FiSun,
} from "react-icons/fi";
import styles from "./Dashboard.module.css";
import homeStyles from "../Home.module.css";
import BrandLogo from "../../Component/BrandLogo.jsx";

const Verify = lazy(() => import("../verification/Verify.jsx"));

function formatActivity(activity) {
  const event = activity.event_type === "enroll"
    ? "Face enrollment"
    : activity.event_type === "reenroll"
      ? "Face re-enrollment"
      : activity.event_type === "verify"
        ? "Face verification"
        : activity.event_type?.replaceAll("_", " ") || "Account activity";
  const detail = activity.detail?.replace(/^enrolled_id=\d+\s*/, "") || (activity.success ? "Completed successfully" : "Failed");
  const date = new Date(activity.created_at);
  const time = Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  return { event, detail, time };
}

const ADMIN_SECTIONS = [
  { id: "overview", label: "Overview", group: "WORKSPACE", path: "/admin", icon: <FiGrid size={16}/> },
  { id: "accounts", label: "User management", group: "WORKSPACE", path: "/admin/users", icon: <FiUsers size={16}/> },
  { id: "enrollments", label: "Enrollment records", group: "WORKSPACE", path: "/admin/enrollments", icon: <FiCamera size={16}/> },
  { id: "verification", label: "Verification", group: "WORKSPACE", path: "/admin/verification", icon: <FiSearch size={16}/> },
  { id: "activity", label: "Activity logs", group: "WORKSPACE", path: "/admin/activity", icon: <FiList size={16}/> },
  { id: "system", label: "System health", group: "SYSTEM", path: "/admin/system", icon: <FiCpu size={16}/> },
  { id: "settings", label: "Account settings", group: "SYSTEM", path: "/admin/settings", icon: <FiSettings size={16}/> },
];

function AdminMetric({ icon, label, value, loading, detail }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(value)) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frameId = window.requestAnimationFrame(() => setAnimatedValue(value));
      return () => window.cancelAnimationFrame(frameId);
    }

    const startedAt = performance.now();
    let frameId;
    const animate = now => {
      const progress = Math.min((now - startedAt) / 550, 1);
      setAnimatedValue(Math.round(value * progress));
      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };
    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <div className={styles.adminMetric}>
      <div className={styles.adminMetricIcon}>{icon}</div>
      <div className={styles.adminMetricLabel}>{label}</div>
      <strong>{loading ? "..." : Number.isFinite(value) ? animatedValue.toLocaleString() : "—"}</strong>
      <small>{detail}</small>
    </div>
  );
}

function UserAccountSettings({ user, updateProfile }) {
  const [profile, setProfile] = useState({ full_name: user?.fullName || "", email: user?.email || "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiUserProfile()
      .then(data => { if (!cancelled) setProfile({ full_name: data.full_name, email: data.email || "" }); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSavingProfile(true);
    setError("");
    setNotice("");
    try {
      const updated = await apiUpdateUserProfile(
        profile.full_name.trim(),
        profile.email.trim(),
        formData.get("current_password"),
      );
      setProfile({ full_name: updated.full_name, email: updated.email || "" });
      updateProfile(updated);
      setCurrentPassword("");
      setNotice("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    setSavingPassword(true);
    setError("");
    setNotice("");
    try {
      const result = await apiUpdateUserPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <main className={homeStyles.accountPage}>
      <header className={homeStyles.accountPageHeader}>
        <div>
          <span className={homeStyles.dashboardEyebrow}><i /> YOUR ACCOUNT</span>
          <h1>Settings</h1>
          <p>Manage your account details and sign-in security.</p>
        </div>
        <Link to="/" className={homeStyles.accountBack}><FiArrowLeft /> Dashboard</Link>
      </header>
      {error && <div className={homeStyles.accountMessageError} role="alert"><FiAlertCircle />{error}</div>}
      {notice && <div className={homeStyles.accountMessageSuccess} role="status"><FiCheckCircle />{notice}</div>}
      <div className={homeStyles.accountSettingsGrid}>
        <section className={homeStyles.accountPanel}>
          <header><span className={homeStyles.accountPanelIcon}><FiUser /></span><div><h2>Profile details</h2><p>Update your name or email address</p></div></header>
          <form className={homeStyles.accountForm} onSubmit={saveProfile}>
            <label>Full name<input name="full_name" required maxLength="150" autoComplete="name" value={profile.full_name} onChange={event => setProfile(current => ({ ...current, full_name: event.target.value }))} /></label>
            <label>Email address<input name="email" type="email" required maxLength="255" autoComplete="email" value={profile.email} onChange={event => setProfile(current => ({ ...current, email: event.target.value }))} /></label>
            <label>Current password<input name="current_password" type="password" required autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label>
            <p>Confirm your current password to save profile changes.</p>
            <button type="submit" className={homeStyles.accountSubmit} disabled={loading || savingProfile}>{savingProfile ? "Saving..." : <><FiSave /> Save profile</>}</button>
          </form>
        </section>
        <section className={homeStyles.accountPanel}>
          <header><span className={homeStyles.accountPanelIcon}><FiLock /></span><div><h2>Password</h2><p>Choose a new password for your account</p></div></header>
          <form className={homeStyles.accountForm} onSubmit={changePassword}>
            <label>Current password<input type="password" required autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label>
            <label>New password<input type="password" required minLength="8" maxLength="128" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>
            <label>Confirm new password<input type="password" required minLength="8" maxLength="128" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>
            <p>Changing your password revokes existing refresh sessions.</p>
            <button type="submit" className={homeStyles.accountSubmit} disabled={savingPassword}>{savingPassword ? "Updating..." : <><FiLock /> Update password</>}</button>
          </form>
        </section>
      </div>
    </main>
  );
}

function AccountPageLoading() {
  return <main className={homeStyles.accountPage}><p className={homeStyles.accountLoading}>Checking your secure session...</p></main>;
}

export function UserSettingsPage() {
  const { user, updateProfile, isLoggedIn, checking } = useAuth();
  const location = useLocation();

  if (checking) return <AccountPageLoading />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  return <UserAccountSettings user={user} updateProfile={updateProfile} />;
}

export function UserProfilePage() {
  const { user, isLoggedIn, checking } = useAuth();
  const location = useLocation();
  const [account, setAccount] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");

  const fetchProfileData = useCallback(() => Promise.allSettled([
      apiUserProfile(),
      apiUserEnrollmentProfile(),
    ]), []);

  useEffect(() => {
    if (!isLoggedIn || checking) return undefined;
    let cancelled = false;
    fetchProfileData().then(([accountResult, enrollmentResult]) => {
      if (cancelled) return;
      if (accountResult.status === "fulfilled") {
        setAccount(accountResult.value);
        setProfileError("");
      } else {
        setProfileError(accountResult.reason.message || "Could not load your account details.");
      }
      if (enrollmentResult.status === "fulfilled") {
        setEnrollment(enrollmentResult.value);
        setEnrollmentError("");
      } else {
        setEnrollmentError(enrollmentResult.reason.message || "Could not load your enrollment details.");
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [checking, fetchProfileData, isLoggedIn]);

  function refreshProfile() {
    setLoading(true);
    fetchProfileData().then(([accountResult, enrollmentResult]) => {
      if (accountResult.status === "fulfilled") {
        setAccount(accountResult.value);
        setProfileError("");
      } else {
        setProfileError(accountResult.reason.message || "Could not load your account details.");
      }
      if (enrollmentResult.status === "fulfilled") {
        setEnrollment(enrollmentResult.value);
        setEnrollmentError("");
      } else {
        setEnrollmentError(enrollmentResult.reason.message || "Could not load your enrollment details.");
      }
      setLoading(false);
    });
  }

  if (checking) return <AccountPageLoading />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;

  const displayName = account?.full_name || user?.fullName || "—";
  const displayEmail = account?.email || user?.email || "—";
  const enrolledAt = enrollment?.enrolled_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(enrollment.enrolled_at))
    : "—";

  return (
    <main className={homeStyles.accountPage}>
      <header className={homeStyles.accountPageHeader}>
        <div>
          <span className={homeStyles.dashboardEyebrow}><i /> YOUR ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Your account information and saved facial enrollment.</p>
        </div>
        <div className={homeStyles.accountHeaderActions}>
          <button type="button" className={homeStyles.accountBack} onClick={refreshProfile} disabled={loading}><FiRefreshCw className={loading ? homeStyles.dashboardRefreshing : ""} /> Refresh</button>
          <Link to="/settings" className={homeStyles.accountBack}><FiSettings /> Settings</Link>
        </div>
      </header>

      {profileError && <div className={homeStyles.accountMessageError} role="alert"><FiAlertCircle />{profileError}</div>}
      {enrollmentError && <div className={homeStyles.accountMessageError} role="alert"><FiAlertCircle />{enrollmentError}</div>}

      <div className={homeStyles.profileContentGrid}>
        <section className={homeStyles.profileCard}>
          <header className={homeStyles.profileCardHeader}><span className={homeStyles.accountPanelIcon}><FiUser /></span><div><span>ACCOUNT</span><h2>Personal information</h2></div></header>
          {loading && !account ? <div className={homeStyles.profileLoading}><i /><i /></div> : (
            <dl className={homeStyles.profileDetails}>
              <div><dt>Full name</dt><dd>{displayName}</dd></div>
              <div><dt>Email address</dt><dd>{displayEmail}</dd></div>
              <div><dt>Account ID</dt><dd>{user?.userId || "—"}</dd></div>
            </dl>
          )}
          <Link to="/settings" className={homeStyles.profileInlineLink}>Edit account settings <FiArrowRight /></Link>
        </section>

        <section className={homeStyles.profileCard}>
          <header className={homeStyles.profileCardHeader}><span className={homeStyles.accountPanelIcon}><FiCamera /></span><div><span>ENROLLMENT</span><h2>Facial profile</h2></div></header>
          {loading && !enrollment ? <div className={homeStyles.profileLoading}><i /><i /><i /></div> : enrollmentError ? (
            <p className={homeStyles.profileEmpty}>Enrollment information could not be loaded.</p>
          ) : enrollment?.enrolled ? (
            <dl className={homeStyles.profileDetails}>
              <div><dt>Full name</dt><dd>{enrollment.full_name || "—"}</dd></div>
              <div><dt>Gender</dt><dd>{enrollment.gender || "—"}</dd></div>
              <div><dt>Matric number</dt><dd>{enrollment.matric_number || "—"}</dd></div>
              <div><dt>Program</dt><dd>{enrollment.program || "—"}</dd></div>
              <div><dt>Enrolled</dt><dd>{enrolledAt}</dd></div>
              <div><dt>Face images</dt><dd>{enrollment.face_count}</dd></div>
            </dl>
          ) : enrollment?.in_progress ? (
            <p className={homeStyles.profileEmpty}>Your facial enrollment is still processing.</p>
          ) : (
            <div className={homeStyles.profileEmpty}><p>You have not enrolled a facial profile yet.</p><Link to="/enrollment">Start enrollment <FiArrowRight /></Link></div>
          )}
        </section>
      </div>

      <section className={homeStyles.profileCard}>
        <header className={homeStyles.profileCardHeader}><span className={homeStyles.accountPanelIcon}><FiImage /></span><div><span>YOUR ENROLLMENT</span><h2>Enrolled images</h2></div></header>
        {loading && !enrollment ? <div className={homeStyles.profileLoading}><i /><i /><i /></div> : enrollmentError ? (
          <p className={homeStyles.profileEmpty}>Your enrolled images could not be loaded.</p>
        ) : enrollment?.images?.length ? (
          <div className={homeStyles.profileImageGrid}>
            {enrollment.images.map((image, index) => (
              <figure key={image.id}>
                <img src={`data:${image.content_type};base64,${image.image_base64}`} alt={`Enrolled face image ${index + 1}`} loading="lazy" />
                <figcaption>Enrollment image {index + 1}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className={homeStyles.profileEmpty}>No enrolled images are available.</p>
        )}
      </section>
    </main>
  );
}

function AdminDashboard({ user, updateProfile }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();
  const activeSection = ADMIN_SECTIONS.find(item => item.path === location.pathname);
  const section = activeSection?.id || "overview";
  const currentSection = activeSection || ADMIN_SECTIONS[0];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsTotal, setEnrollmentsTotal] = useState(0);
  const [enrollmentsPage, setEnrollmentsPage] = useState(0);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [expandedEnrollment, setExpandedEnrollment] = useState(null);
  const [enrollmentFaces, setEnrollmentFaces] = useState({});
  const [facesLoadingId, setFacesLoadingId] = useState(null);
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState(null);
  const [overview, setOverview] = useState(null);
  const [activity, setActivity] = useState([]);
  const [profile, setProfile] = useState(null);
  const [query, setQuery] = useState("");
  const [enrollmentQuery, setEnrollmentQuery] = useState("");
  const [activityQuery, setActivityQuery] = useState("");
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [granting, setGranting] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantError, setGrantError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiAdminOverview(), apiAdminUsers(), apiAdminActivity(), apiAdminProfile()])
      .then(([summary, users, events, adminProfile]) => {
        if (cancelled) return;
        setOverview(summary);
        setAccounts(users);
        setActivity(events);
        setProfile(adminProfile);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const resetMenus = window.setTimeout(() => {
      setMobileSidebarOpen(false);
      setProfileMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(resetMenus);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen || !window.matchMedia("(max-width: 760px)").matches) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => {
      if (event.key === "Escape") setMobileSidebarOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileSidebarOpen]);

  async function refreshConsole() {
    setRefreshing(true);
    setError("");
    try {
      const [summary, users, events, adminProfile] = await Promise.all([
        apiAdminOverview(), apiAdminUsers(), apiAdminActivity(), apiAdminProfile(),
      ]);
      setOverview(summary);
      setAccounts(users);
      setActivity(events);
      setProfile(adminProfile);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  const loadEnrollments = useCallback(async (page = 0) => {
    setEnrollmentsLoading(true);
    setError("");
    setEnrollmentFaces({});
    try {
      const result = await apiAdminEnrollments(page * 20, 20);
      setEnrollments(result.items);
      setEnrollmentsTotal(result.total);
      setEnrollmentsPage(page);
      setExpandedEnrollment(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (section !== "enrollments") return undefined;
    const loadInitialPage = window.setTimeout(() => loadEnrollments(0), 0);
    return () => window.clearTimeout(loadInitialPage);
  }, [loadEnrollments, section]);

  async function toggleEnrollmentFaces(enrollment) {
    if (expandedEnrollment === enrollment.user_id) {
      setExpandedEnrollment(null);
      return;
    }
    setExpandedEnrollment(enrollment.user_id);
    if (enrollmentFaces[enrollment.user_id]) return;
    setFacesLoadingId(enrollment.user_id);
    setError("");
    try {
      const faces = await apiAdminEnrollmentFaces(enrollment.user_id);
      setEnrollmentFaces(current => ({ ...current, [enrollment.user_id]: faces }));
    } catch (err) {
      setError(err.message);
      setExpandedEnrollment(null);
    } finally {
      setFacesLoadingId(null);
    }
  }

  async function deleteEnrollment(enrollment) {
    if (!window.confirm(`Delete all ${enrollment.face_count} enrolled face images for ${enrollment.full_name}? They will be able to enroll again.`)) return;
    setDeletingEnrollmentId(enrollment.user_id);
    setError("");
    try {
      await apiAdminDeleteEnrollment(enrollment.user_id);
      setEnrollments(current => current.filter(item => item.user_id !== enrollment.user_id));
      setEnrollmentsTotal(current => Math.max(0, current - 1));
      setEnrollmentFaces(current => {
        const updated = { ...current };
        delete updated[enrollment.user_id];
        return updated;
      });
      setExpandedEnrollment(null);
      setOverview(current => current ? {
        ...current,
        total_enrolled: Math.max(0, current.total_enrolled - enrollment.face_count),
      } : current);
      setNotice(`Enrollment for ${enrollment.full_name} was deleted. They can enroll again.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingEnrollmentId(null);
    }
  }

  async function grantAdmin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setGranting(true);
    setGrantError("");
    try {
      const existingAccount = accounts.find(account => account.email.toLowerCase() === formData.get("email").trim().toLowerCase());
      const granted = await apiGrantAdminAccess(
        formData.get("full_name").trim(),
        formData.get("email").trim(),
      );
      setAccounts(current => current.map(account => account.id === granted.id ? { ...account, ...granted, is_admin: true } : account));
      if (!existingAccount?.is_admin) {
        setOverview(current => current ? {
          ...current,
          total_admins: current.total_admins + 1,
        } : current);
      }
      setGrantOpen(false);
      setNotice(`Admin access granted to ${granted.full_name} (${granted.email}).`);
      form.reset();
    } catch (err) {
      setGrantError(err.message);
    } finally {
      setGranting(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setProfileSaving(true);
    setSettingsError("");
    try {
      const updated = await apiUpdateAdminProfile(
        formData.get("full_name").trim(),
        formData.get("email").trim(),
      );
      setProfile(updated);
      updateProfile(updated);
      setAccounts(current => current.map(account => account.id === updated.id ? { ...account, ...updated } : account));
      setNotice("Profile settings saved.");
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = formData.get("new_password");
    if (newPassword !== formData.get("confirm_password")) {
      setSettingsError("The new passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    setSettingsError("");
    try {
      const result = await apiUpdateAdminPassword(formData.get("current_password"), newPassword);
      form.reset();
      setNotice(result.message);
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  async function deleteAccount(account) {
    if (!window.confirm(`Delete the account for ${account.email}? This cannot be undone.`)) return;
    setDeletingId(account.id);
    setError("");
    try {
      await apiDeleteAdminUser(account.id);
      setAccounts(current => current.filter(item => item.id !== account.id));
      setOverview(current => current ? {
        ...current,
        total_users: Math.max(0, current.total_users - 1),
        total_admins: Math.max(0, current.total_admins - (account.is_admin ? 1 : 0)),
      } : current);
      setNotice(`Account ${account.email} was deleted.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredAccounts = accounts.filter(account =>
    `${account.full_name} ${account.email}`.toLowerCase().includes(normalizedQuery),
  );
  const normalizedEnrollmentQuery = enrollmentQuery.trim().toLowerCase();
  const filteredEnrollments = enrollments.filter(enrollment =>
    `${enrollment.full_name} ${enrollment.matric_number} ${enrollment.account_name} ${enrollment.account_email} ${enrollment.program}`
      .toLowerCase()
      .includes(normalizedEnrollmentQuery),
  );
  const normalizedActivityQuery = activityQuery.trim().toLowerCase();
  const filteredActivity = activity.filter(entry =>
    `${entry.event_type} ${entry.actor_id ?? ""} ${entry.actor_name || ""} ${entry.actor_email || ""} ${entry.detail || ""}`.toLowerCase().includes(normalizedActivityQuery),
  );
  const formattedDate = value => value ? new Date(value).toLocaleString() : "—";

  function renderActivityRows(rows) {
    if (loading) return <tr><td colSpan="4" className={styles.tableMessage}>Loading audit events...</td></tr>;
    if (!rows.length) return <tr><td colSpan="4" className={styles.tableMessage}>No matching audit events.</td></tr>;
    return rows.map(entry => {
      const isExpanded = expandedActivity === entry.id;
      return (
        <Fragment key={entry.id}>
          <tr>
          <td data-label="Event"><button type="button" className={styles.auditDisclosure} aria-expanded={isExpanded} aria-controls={`audit-details-${entry.id}`} onClick={() => setExpandedActivity(isExpanded ? null : entry.id)}><span className={styles.eventType}>{entry.event_type === "reenroll" ? "re-enrolled" : entry.event_type.replaceAll("_", " ")}</span><FiChevronDown className={isExpanded ? styles.auditChevronOpen : ""} size={14}/></button></td>
          <td data-label="Account" className={styles.accountEmail}>{entry.actor_name || (entry.actor_id ? `Account #${entry.actor_id}` : "Unregistered account")}</td>
          <td data-label="Result"><span className={`${styles.eventStatus} ${entry.success ? styles.eventSuccess : styles.eventFailure}`}>{entry.success ? "Success" : "Failed"}</span></td>
          <td data-label="Date & time" className={styles.auditDetail}>{formattedDate(entry.created_at)}</td>
          </tr>
          {isExpanded && <tr id={`audit-details-${entry.id}`} className={styles.auditExpandedRow}><td colSpan="4"><div className={styles.auditExpanded}>
            <div><span>User</span><strong>{entry.actor_name || (entry.actor_id ? `Account #${entry.actor_id}` : "Unregistered account")}</strong></div>
            {entry.actor_email && <div><span>Email</span><strong>{entry.actor_email}</strong></div>}
            {entry.detail && <div className={styles.auditEventDetail}><span>Event details</span><strong>{entry.detail}</strong></div>}
          </div></td></tr>}
        </Fragment>
      );
    });
  }

  const sectionTitle = {
    overview: "Overview",
    accounts: "Account management",
    enrollments: "Enrollment records",
    verification: "Face verification",
    activity: "Audit log",
    system: "System health",
    settings: "Account settings",
  }[section];

  return (
    <div
      className={`${styles.adminFrame} ${sidebarCollapsed ? styles.adminFrameCollapsed : ""} ${mobileSidebarOpen ? styles.adminFrameDrawerOpen : ""}`}
      data-theme={theme}
    >
      {mobileSidebarOpen && (
        <button
          type="button"
          className={styles.adminSidebarBackdrop}
          aria-label="Close admin navigation"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside id="admin-navigation" className={styles.adminSidebar} aria-label="Admin navigation">
        <div className={styles.adminBrand}>
          <Link to="/admin" aria-label="CogniFace Admin overview">
            <BrandLogo alt="CogniFace" />
          </Link>
          <span>ADMINISTRATION</span>
          <button
            type="button"
            className={styles.adminCollapseButton}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(value => !value)}
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className={styles.adminMobileClose}
            aria-label="Close admin navigation"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <div className={styles.adminSidebarRule} />
        {["WORKSPACE", "SYSTEM"].map(group => (
          <div className={styles.adminNavGroup} key={group}>
            <span className={styles.adminNavLabel}>{group}</span>
            <nav className={styles.adminNav} aria-label={`${group.toLowerCase()} sections`}>
              {ADMIN_SECTIONS.filter(item => item.group === group).map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`${styles.adminNavItem} ${section === item.id ? styles.adminNavActive : ""}`}
                  aria-current={section === item.id ? "page" : undefined}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={() => {
                    setNotice("");
                    setMobileSidebarOpen(false);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {section === item.id && <i aria-hidden="true" />}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        <div className={styles.adminSidebarFoot}>
          <div className={styles.adminSidebarUser}>
            <div className={styles.adminAvatar}>
              {(user.fullName || "Admin").split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <strong>{user.fullName || "Administrator"}</strong>
              <small>Administrator</small>
            </div>
          </div>
          <button type="button" className={styles.adminLogout} onClick={logout} title={sidebarCollapsed ? "Sign out" : undefined}>
            <FiLogOut /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className={styles.adminMain}>
        <header className={styles.adminTopbar}>
          <div className={styles.adminTopbarHeading}>
            <button
              type="button"
              className={styles.adminMenuButton}
              aria-label={mobileSidebarOpen ? "Close admin navigation" : "Open admin navigation"}
              aria-expanded={mobileSidebarOpen}
              aria-controls="admin-navigation"
              onClick={() => setMobileSidebarOpen(value => !value)}
            >
              <FiMenu />
            </button>
            <div>
              <div className={styles.adminBreadcrumb}>ADMINISTRATION <span>/</span> {currentSection.label.toUpperCase()}</div>
              <h1>{section === "overview" ? "Admin Dashboard" : sectionTitle}</h1>
            </div>
          </div>
          <div className={styles.adminTopbarActions}>
            <button type="button" className={styles.adminRefresh} onClick={refreshConsole} disabled={refreshing} title="Refresh dashboard data" aria-label="Refresh dashboard data"><FiRefreshCw className={refreshing ? styles.refreshing : ""} size={16}/></button>
            <button type="button" className={styles.adminRefresh} onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
              {theme === "light" ? <FiMoon size={16}/> : <FiSun size={16}/>}
            </button>
            <div className={styles.adminProfileMenu}>
              <button type="button" className={styles.adminProfileButton} aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(value => !value)}>
                <span className={styles.adminAvatar}>{(user.fullName || "Admin").split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase()}</span>
                <span className={styles.adminProfileName}><strong>{profile?.full_name || user.fullName || "Administrator"}</strong><small>Admin account</small></span>
                <FiChevronDown className={profileMenuOpen ? styles.adminProfileChevronOpen : ""}/>
              </button>
              {profileMenuOpen && (
                <div className={styles.adminProfileDropdown}>
                  <Link to="/admin/settings"><FiSettings /> Account settings</Link>
                  <button type="button" onClick={logout}><FiLogOut /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {notice && <div className={styles.adminNotice}><FiCheckCircle size={15}/>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification"><FiX size={15}/></button></div>}
        {error && <div className={styles.adminError}><FiAlertCircle size={15}/>{error}</div>}
        {settingsError && <div className={styles.adminError}><FiAlertCircle size={15}/>{settingsError}</div>}

        {section === "overview" && (
          <div className={styles.adminPageContent}>
            <div className={styles.adminWelcome}><div><span>ADMINISTRATION</span><h2>Good to see you, {user.fullName.split(" ")[0]}.</h2><p>Manage accounts, enrollments, verification, and system settings.</p></div>{overview && <span className={styles.liveIndicator}><i/> API CONNECTED</span>}</div>
            <section className={styles.adminMetrics} aria-label="Platform metrics">
              <AdminMetric icon={<FiUsers size={17}/>} label="Registered users" value={overview?.total_users} loading={loading} detail="Accounts in database"/>
              <AdminMetric icon={<FiShield size={17}/>} label="Admin accounts" value={overview?.total_admins} loading={loading} detail="Privileged accounts"/>
              <AdminMetric icon={<FiUserCheck size={17}/>} label="Enrolled face records" value={overview?.total_enrolled} loading={loading} detail="Images stored in the index"/>
              <AdminMetric icon={<FiActivity size={17}/>} label="Successful matches" value={overview?.successful_verifications} loading={loading} detail="Verified operations"/>
            </section>

            <div className={styles.adminOverviewGrid}>
              <section className={styles.adminPanel}>
                <div className={styles.adminPanelHeading}><div><h2>Service status</h2><p>Live health from the backend</p></div><Link to="/admin/system">Details <FiChevronRight size={14}/></Link></div>
                <div className={styles.serviceRows}>
                  <div><span className={styles.serviceIcon}><FiActivity size={15}/></span><span><strong>API service</strong><small>Admin overview endpoint</small></span><b className={overview ? styles.statusOnline : styles.statusNeutral}>{overview ? "Online" : loading ? "Checking" : "Unavailable"}</b></div>
                  <div><span className={styles.serviceIcon}><FiDatabase size={15}/></span><span><strong>Database</strong><small>Account and event queries</small></span><b className={overview?.database_status === "online" ? styles.statusOnline : overview ? styles.statusOffline : styles.statusNeutral}>{overview?.database_status || (loading ? "Checking" : "Unavailable")}</b></div>
                  <div><span className={styles.serviceIcon}><FiCpu size={15}/></span><span><strong>FAISS index</strong><small>{overview ? `${overview.faiss_total} vectors loaded` : loading ? "Checking index status" : "Index status unavailable"}</small></span><b className={overview?.faiss_ready ? styles.statusOnline : overview ? styles.statusOffline : styles.statusNeutral}>{overview?.faiss_ready ? "Ready" : loading ? "Checking" : "Unavailable"}</b></div>
                </div>
              </section>
              <section className={styles.adminPanel}>
                <div className={styles.adminPanelHeading}><div><h2>Security signals</h2><p>Configuration indicators only</p></div><FiKey size={17}/></div>
                <div className={styles.securityRows}>
                  <div><span>Admin allowlist</span><b className={overview?.admin_allowlist_configured ? styles.statusOnline : styles.statusNeutral}>{overview ? overview.admin_allowlist_configured ? "Configured" : "Not configured" : loading ? "Checking" : "Unavailable"}</b></div>
                  <div><span>Request signing</span><b className={overview?.request_signing_configured ? styles.statusOnline : overview ? styles.statusOffline : styles.statusNeutral}>{overview ? overview.request_signing_configured ? "Configured" : "Review configuration" : loading ? "Checking" : "Unavailable"}</b></div>
                  {/* <div><span>Failed login attempts</span><strong>{loading ? "..." : overview?.failed_logins?.toLocaleString()}</strong></div> */}
                </div>
              </section>
            </div>

            <section className={styles.adminPanel}>
                <div className={styles.adminPanelHeading}><div><h2>Latest audit events</h2><p>Recent platform events; login events are excluded</p></div><Link to="/admin/activity">View audit log <FiChevronRight size={14}/></Link></div>
                <div className={`${styles.tableWrap} ${styles.mobileCardTable}`}><table className={`${styles.accountsTable} ${styles.auditRecordsTable}`}><thead><tr><th>Event</th><th>Actor</th><th>Result</th><th>Date &amp; time</th></tr></thead><tbody>{renderActivityRows(activity.slice(0, 6))}</tbody></table></div>
            </section>
          </div>
        )}

        {section === "accounts" && (
          <div className={styles.adminPageContent}>
            <div className={styles.sectionIntro}><div><h2>Accounts</h2><p>Review registered users and grant admin access to existing accounts.</p></div><button type="button" className={styles.adminPrimaryButton} onClick={() => { setGrantError(""); setGrantOpen(true); }}><FiPlus size={16}/> Add admin</button></div>
            <section className={styles.adminPanel}>
              <div className={styles.accountToolbar}><div className={styles.accountCounts}><strong>{accounts.length.toLocaleString()}</strong> total <span>{accounts.filter(account => account.is_admin).length.toLocaleString()} admins</span></div><label className={styles.accountSearch}><FiSearch size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name or email" /></label></div>
              <div className={`${styles.tableWrap} ${styles.mobileCardTable}`}><table className={`${styles.accountsTable} ${styles.accountRecordsTable}`}><thead><tr><th>User</th><th>Access</th><th>Joined</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead><tbody>
                {loading ? <tr><td colSpan="4" className={styles.tableMessage}>Loading accounts...</td></tr> : filteredAccounts.length ? filteredAccounts.map(account => (
                  <tr key={account.id}><td data-label="User"><div className={styles.accountName}>{account.full_name}</div><div className={styles.accountEmail}>{account.email}</div></td><td data-label="Access"><span className={`${styles.roleBadge} ${account.is_admin ? styles.roleAdmin : ""}`}>{account.is_admin ? "Admin" : "User"}</span></td><td data-label="Joined" className={styles.joinDate}>{new Date(account.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</td><td data-label="Actions" className={styles.accountActions}><button type="button" onClick={() => deleteAccount(account)} disabled={deletingId === account.id || String(account.id) === user.userId} aria-label={`Delete ${account.full_name}`} title={String(account.id) === user.userId ? "You cannot delete your own account" : "Delete account"}><FiTrash2 size={15}/></button></td></tr>
                )) : <tr><td colSpan="4" className={styles.tableMessage}>{accounts.length ? "No accounts match your search." : "No registered accounts yet."}</td></tr>}
              </tbody></table></div>
              <div className={styles.tableFooter}>Showing {filteredAccounts.length} of {accounts.length} accounts</div>
            </section>
          </div>
        )}

        {section === "enrollments" && (
          <div className={styles.adminPageContent}>
            <div className={styles.sectionIntro}><div><h2>Enrollment management</h2><p>Inspect registered identities and their face images. This is the administrative record view, not the user enrollment workflow.</p></div></div>
            <section className={styles.adminPanel}>
              <div className={styles.accountToolbar}>
                <div className={styles.accountCounts}><strong>{enrollmentsTotal.toLocaleString()}</strong> enrolled identities</div>
                <label className={styles.accountSearch}><FiSearch size={16}/><input value={enrollmentQuery} onChange={event => setEnrollmentQuery(event.target.value)} placeholder="Search this page by name, account, or program" /></label>
                <button type="button" className={styles.refreshButton} onClick={() => loadEnrollments(enrollmentsPage)} disabled={enrollmentsLoading} aria-label="Refresh enrollments" title="Refresh enrollments"><FiRefreshCw size={15} className={enrollmentsLoading ? styles.refreshing : ""}/></button>
              </div>
              <div className={`${styles.tableWrap} ${styles.mobileCardTable}`}><table className={styles.enrollmentTable}><thead><tr><th>Enrolled person</th><th>Account owner</th><th>Program</th><th>Photos</th><th>Enrolled</th><th>Actions</th></tr></thead><tbody>
                {enrollmentsLoading ? <tr><td colSpan="6" className={styles.tableMessage}>Loading enrollments...</td></tr> : filteredEnrollments.length ? filteredEnrollments.map(enrollment => (
                  <Fragment key={enrollment.user_id}>
                    <tr className={styles.enrollmentRecordRow}>
                      <td data-label="Enrolled person"><div className={styles.accountName}>{enrollment.full_name}</div><div className={styles.accountEmail}>{enrollment.matric_number}</div></td>
                      <td data-label="Account owner"><div className={styles.accountName}>{enrollment.account_name}</div><div className={styles.accountEmail}>{enrollment.account_email}</div></td>
                      <td data-label="Program" className={styles.joinDate}>{enrollment.program} · {enrollment.gender}</td>
                      <td data-label="Photos"><span className={styles.roleBadge}>{enrollment.face_count}</span></td>
                      <td data-label="Enrolled" className={styles.joinDate}>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td data-label="Actions" className={styles.enrollmentActions}>
                        <button type="button" className={styles.viewFacesButton} onClick={() => toggleEnrollmentFaces(enrollment)} aria-expanded={expandedEnrollment === enrollment.user_id}>
                          <FiCamera size={14}/>{expandedEnrollment === enrollment.user_id ? "Hide photos" : "View photos"}
                        </button>
                        <button type="button" className={styles.deleteEnrollmentButton} onClick={() => deleteEnrollment(enrollment)} disabled={deletingEnrollmentId === enrollment.user_id} aria-label={`Delete enrollment for ${enrollment.full_name}`} title="Delete all enrollment photos"><FiTrash2 size={14}/></button>
                      </td>
                    </tr>
                    {expandedEnrollment === enrollment.user_id && <tr className={styles.enrollmentExpandedRow}><td colSpan="6">
                      {facesLoadingId === enrollment.user_id ? <div className={styles.enrollmentImagesLoading}><FiRefreshCw className={styles.refreshing} size={15}/> Loading face photos...</div> : (
                        <div className={styles.enrollmentImages}>
                          {(enrollmentFaces[enrollment.user_id] || []).map((face, index) => (
                            <figure key={face.id}><img src={`data:${face.content_type};base64,${face.image_base64}`} alt={`Enrolled face ${index + 1} for ${enrollment.full_name}`} loading="lazy"/><figcaption>Photo {index + 1}</figcaption></figure>
                          ))}
                        </div>
                      )}
                    </td></tr>}
                  </Fragment>
                )) : <tr><td colSpan="6" className={styles.tableMessage}>{enrollments.length ? "No current-page enrollments match your search." : "No face enrollments found."}</td></tr>}
              </tbody></table></div>
              <div className={styles.enrollmentPagination}><span>Showing {enrollmentsTotal ? enrollmentsPage * 20 + 1 : 0}–{Math.min((enrollmentsPage + 1) * 20, enrollmentsTotal)} of {enrollmentsTotal}</span><div><button type="button" onClick={() => loadEnrollments(enrollmentsPage - 1)} disabled={enrollmentsPage === 0 || enrollmentsLoading}>Previous</button><button type="button" onClick={() => loadEnrollments(enrollmentsPage + 1)} disabled={(enrollmentsPage + 1) * 20 >= enrollmentsTotal || enrollmentsLoading}>Next</button></div></div>
            </section>
          </div>
        )}

        {section === "verification" && (
          <div className={styles.adminPageContent}>
            <div className={`${styles.sectionIntro} ${styles.verificationIntro}`}>
              <div>
                <span>IDENTITY LOOKUP</span>
                <h2>System-wide verification</h2>
                <p>Search a submitted face against every enrolled identity, then review the actual verification events below.</p>
              </div>
              <span className={styles.verificationScope}><FiShield /> All enrolled profiles</span>
            </div>
            <Verify adminMode />
            <section className={styles.adminPanel}>
              <div className={styles.adminPanelHeading}><div><h2>Recorded verification activity</h2><p>Actual verification events returned by the admin activity endpoint</p></div><Link to="/admin/activity">Full activity log <FiChevronRight size={14}/></Link></div>
              <div className={`${styles.tableWrap} ${styles.mobileCardTable}`}><table className={`${styles.accountsTable} ${styles.auditRecordsTable}`}><thead><tr><th>Event</th><th>Account</th><th>Result</th><th>Date &amp; time</th></tr></thead><tbody>
                {renderActivityRows(activity.filter(entry => entry.event_type === "verify"))}
              </tbody></table></div>
            </section>
          </div>
        )}

        {section === "activity" && (
          <div className={styles.adminPageContent}>
            <div className={styles.sectionIntro}><div><h2>Audit log</h2><p>Account and system events.</p></div><label className={styles.accountSearch}><FiSearch size={16}/><input value={activityQuery} onChange={event => setActivityQuery(event.target.value)} placeholder="Filter event, account, or email" /></label></div>
            <section className={styles.adminPanel}><div className={`${styles.tableWrap} ${styles.mobileCardTable}`}><table className={`${styles.accountsTable} ${styles.auditRecordsTable}`}><thead><tr><th>Event</th><th>Account</th><th>Result</th><th>Date &amp; time</th></tr></thead><tbody>{renderActivityRows(filteredActivity)}</tbody></table></div><div className={styles.tableFooter}>{filteredActivity.length} events (up to 100 latest records)</div></section>
          </div>
        )}

        {section === "system" && (
          <div className={styles.adminPageContent}>
            <div className={styles.sectionIntro}><div><h2>System health</h2><p>Operational checks and safe configuration indicators.</p></div></div>
            <section className={styles.systemGrid}>
              <div className={styles.systemCard}><span className={styles.systemIcon}><FiActivity size={18}/></span><div><small>API SERVICE</small><h3>Online</h3><p>This page loaded live admin data from the API.</p></div><b className={styles.statusOnline}>HEALTHY</b></div>
              <div className={styles.systemCard}><span className={styles.systemIcon}><FiDatabase size={18}/></span><div><small>DATABASE</small><h3>{overview?.database_status === "online" ? "Connected" : loading ? "Checking" : "Unavailable"}</h3><p>User records and audit data are queryable.</p></div><b className={overview?.database_status === "online" ? styles.statusOnline : styles.statusOffline}>{overview?.database_status === "online" ? "HEALTHY" : "CHECK"}</b></div>
              <div className={styles.systemCard}><span className={styles.systemIcon}><FiCpu size={18}/></span><div><small>FAISS FACE INDEX</small><h3>{overview?.faiss_ready ? "Loaded" : loading ? "Checking" : "Unavailable"}</h3><p>{overview?.faiss_total ?? 0} embeddings currently in memory.</p></div><b className={overview?.faiss_ready ? styles.statusOnline : styles.statusOffline}>{overview?.faiss_ready ? "HEALTHY" : "CHECK"}</b></div>
            </section>
            <section className={styles.adminPanel}>
              <div className={styles.adminPanelHeading}><div><h2>Security configuration</h2><p>Read-only status checks. Secret values are never returned.</p></div><FiShield size={18}/></div>
              <div className={styles.configRows}>
                <div><span><FiKey size={15}/> Admin email allowlist</span><b>{overview?.admin_allowlist_configured ? "Configured" : "Not configured"}</b></div>
                <div><span><FiShield size={15}/> Request signature validation</span><b>{overview?.request_signing_configured ? "Configured" : "Review backend configuration"}</b></div>
                <div><span><FiUserCheck size={15}/> Active administrator accounts</span><b>{loading ? "..." : overview?.total_admins?.toLocaleString()}</b></div>
              </div>
            </section>
          </div>
        )}

        {section === "settings" && (
          <div className={styles.adminPageContent}>
            <div className={styles.sectionIntro}><div><h2>Account settings</h2><p>Manage your admin profile and sign-in password.</p></div></div>
            <div className={styles.settingsGrid}>
              <section className={styles.adminPanel}>
                <div className={styles.adminPanelHeading}><div><h2>Profile</h2><p>Your registered account details</p></div><FiUser size={17}/></div>
                <form className={styles.settingsForm} onSubmit={saveProfile}>
                  <label>Full name<input name="full_name" required maxLength="150" autoComplete="name" defaultValue={profile?.full_name || user.fullName} /></label>
                  <label>Email address<input name="email" type="email" required maxLength="255" autoComplete="email" defaultValue={profile?.email || ""} /></label>
                  {/* <p>Your name and email are visible in admin audit records.</p> */}
                  <button type="submit" className={styles.adminPrimaryButton} disabled={profileSaving || loading}>{profileSaving ? "Saving..." : <><FiSave size={14}/> Save profile</>}</button>
                </form>
              </section>
              <section className={styles.adminPanel}>
                <div className={styles.adminPanelHeading}><div><h2>Password</h2><p>Confirm your current password to change it</p></div><FiLock size={17}/></div>
                <form className={styles.settingsForm} onSubmit={changePassword}>
                  <label>Current password<input name="current_password" type="password" required autoComplete="current-password" /></label>
                  <label>New password<input name="new_password" type="password" required minLength="8" maxLength="128" autoComplete="new-password" /></label>
                  <label>Confirm new password<input name="confirm_password" type="password" required minLength="8" maxLength="128" autoComplete="new-password" /></label>
                  <p>Changing your password signs out other sessions.</p>
                  <button type="submit" className={styles.adminPrimaryButton} disabled={passwordSaving}>{passwordSaving ? "Updating..." : <><FiLock size={14}/> Update password</>}</button>
                </form>
              </section>
            </div>
          </div>
        )}
      </main>

      {grantOpen && <div className={styles.adminModalBackdrop} onMouseDown={event => { if (event.target === event.currentTarget && !granting) setGrantOpen(false); }}>
        <section className={styles.adminModal} role="dialog" aria-modal="true" aria-labelledby="create-admin-title">
          <header><div><span className={styles.modalIcon}><FiUserPlus size={17}/></span><div><h2 id="create-admin-title">Grant admin access</h2><p>User must already have a registered account.</p></div></div><button type="button" onClick={() => setGrantOpen(false)} disabled={granting} aria-label="Close dialog"><FiX size={18}/></button></header>
          <form onSubmit={grantAdmin}>
            <label>Registered full name<input name="full_name" required maxLength="150" autoComplete="name" placeholder="Administrator name"/></label>
            <label>Registered email<input name="email" type="email" required maxLength="255" autoComplete="email" placeholder="admin@example.com"/></label>
            <p className={styles.grantHelp}>Both fields must match the existing account.</p>
            {grantError && <div className={styles.adminError}><FiAlertCircle size={15}/>{grantError}</div>}
            <div className={styles.modalActions}><button type="button" className={styles.adminCancelButton} onClick={() => setGrantOpen(false)} disabled={granting}>Cancel</button><button type="submit" className={styles.adminPrimaryButton} disabled={granting}><FiPlus size={15}/>{granting ? "Granting..." : "Grant access"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

export function UserDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    const [statsResult, enrollmentResult] = await Promise.allSettled([
      apiDashboardStats(),
      apiEnrollmentStatus(),
    ]);

    const nextErrors = [];
    if (statsResult.status === "fulfilled") setStats(statsResult.value);
    else nextErrors.push(`Dashboard activity: ${statsResult.reason.message || "Could not load dashboard activity."}`);
    if (enrollmentResult.status === "fulfilled") setEnrollment(enrollmentResult.value);
    else nextErrors.push(`Enrollment status: ${enrollmentResult.reason.message || "Could not load enrollment status."}`);
    setErrors(nextErrors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!active) return;
      await loadDashboard();
    };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [loadDashboard]);

  const fullName = user?.fullName || stats?.user_full_name || "";
  const email = user?.email || "";
  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const activities = (stats?.recent_activity || []).filter(activity =>
    ["enroll", "reenroll", "verify", "profile_update"].includes(activity.event_type),
  );
  const enrollmentLabel = enrollment?.in_progress
    ? "In progress"
    : enrollment?.enrolled
      ? "Enrolled"
      : enrollment
        ? "Not enrolled"
        : "Unavailable";

  return (
    <main className={homeStyles.dashboardHome}>
      <div className={homeStyles.dashboardIntro}>
        <div>
          <span className={homeStyles.dashboardEyebrow}><i /> YOUR WORKSPACE</span>
          <h1>Dashboard</h1>
          <p>Welcome back, {firstName}. Here&apos;s an overview of your activity.</p>
        </div>
        <button type="button" className={homeStyles.dashboardRefresh} onClick={loadDashboard} disabled={refreshing} aria-label="Refresh dashboard data">
          <FiRefreshCw className={refreshing ? homeStyles.dashboardRefreshing : ""} /> {refreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {errors.length > 0 && (
        <div className={homeStyles.dashboardError} role="alert">
          <FiAlertCircle />
          <span>{errors.join(" ")}</span>
          <button type="button" onClick={loadDashboard} disabled={refreshing}>Retry</button>
        </div>
      )}

      <section className={homeStyles.overviewStats} aria-label="Account overview statistics">
        <article className={homeStyles.overviewStatCard}>
          <span className={`${homeStyles.overviewStatIcon} ${homeStyles.statIconGreen}`}><FiUserPlus /></span>
          <div>
            <span>Enrolled face images</span>
            <strong>{loading ? <i className={homeStyles.statSkeleton} /> : stats?.total_enrolled ?? "—"}</strong>
            <small>Face samples in your profile</small>
          </div>
          <span className={homeStyles.statCardAccent} />
        </article>
        <article className={homeStyles.overviewStatCard}>
          <span className={`${homeStyles.overviewStatIcon} ${homeStyles.statIconBlue}`}><FiCheckCircle /></span>
          <div>
            <span>Successful verifications</span>
            <strong>{loading ? <i className={homeStyles.statSkeleton} /> : stats?.total_verified ?? "—"}</strong>
            <small>Completed using your account</small>
          </div>
          <span className={homeStyles.statCardAccent} />
        </article>
        <article className={`${homeStyles.overviewStatCard} ${homeStyles.enrollmentStatCard}`}>
          <span className={`${homeStyles.overviewStatIcon} ${enrollment?.enrolled ? homeStyles.statIconGreen : homeStyles.statIconCyan}`}>
            {enrollment?.enrolled ? <FiCheckCircle /> : <FiUser />}
          </span>
          <div>
            <span>Facial profile</span>
            <strong>{loading && !enrollment ? <i className={homeStyles.statSkeleton} /> : enrollmentLabel}</strong>
            <small>{loading && !enrollment ? "Checking enrollment status" : enrollment?.enrolled ? "Ready for matching" : enrollment?.in_progress ? "Processing enrollment" : "Enrollment not complete"}</small>
          </div>
          <span className={homeStyles.statCardAccent} />
        </article>
      </section>

      <section className={homeStyles.dashboardContentGrid}>
        <div className={homeStyles.dashboardColumn}>
          <article className={homeStyles.dashboardInfoCard}>
            <header className={homeStyles.dashboardCardHeader}>
              <div><span className={homeStyles.dashboardSectionLabel}>ENROLLMENT</span><h2>Facial Enrollment</h2></div>
              <span className={`${homeStyles.enrollmentBadge} ${enrollment?.enrolled ? homeStyles.enrollmentBadgeDone : enrollment?.in_progress ? homeStyles.enrollmentBadgePending : ""}`}>
                {loading && !enrollment ? "Checking" : enrollmentLabel}
              </span>
            </header>
            <div className={homeStyles.enrollmentSummary}>
              <span className={homeStyles.enrollmentSummaryIcon}><FiShield /></span>
              <div>
                <strong>{enrollment?.in_progress ? "Processing your enrollment" : enrollment?.enrolled ? `${enrollment.face_count} enrolled face image${enrollment.face_count === 1 ? "" : "s"}` : enrollment ? "No facial profile yet" : "Enrollment data unavailable"}</strong>
                <p>{enrollment?.in_progress ? "The backend is still processing your face profile." : enrollment?.enrolled ? "Your facial profile is ready for matching." : "Enrollment status comes from your authenticated account."}</p>
              </div>
            </div>
          </article>

          <article className={homeStyles.dashboardInfoCard}>
            <header className={homeStyles.dashboardCardHeader}>
              <div><span className={homeStyles.dashboardSectionLabel}>ACCOUNT</span><h2>Your Account</h2></div>
            </header>
            <div className={homeStyles.accountSummary}>
              {fullName && <div><span><FiUser /> Full name</span><strong>{fullName}</strong></div>}
              {email && <div><span><FiMail /> Email address</span><strong>{email}</strong></div>}
              {!fullName && !email && <p>Account information is unavailable.</p>}
            </div>
          </article>
        </div>

        <article className={`${homeStyles.dashboardInfoCard} ${homeStyles.recentActivityCard}`}>
          <header className={homeStyles.dashboardCardHeader}>
            <div><span className={homeStyles.dashboardSectionLabel}>LATEST UPDATES</span><h2>Recent Activity</h2></div>
            <span className={homeStyles.activityCount}>{activities.length} {activities.length === 1 ? "event" : "events"}</span>
          </header>
          {loading && !stats ? (
            <div className={homeStyles.activityLoading}><i /><i /><i /></div>
          ) : activities.length > 0 ? (
            <div className={homeStyles.dashboardActivityList}>
              {activities.map((activity, index) => {
                const item = formatActivity(activity);
                const isEnrollment = activity.event_type === "enroll" || activity.event_type === "reenroll";
                const ActivityIcon = isEnrollment ? FiUserPlus : activity.event_type === "verify" ? FiSearch : FiUser;
                return (
                  <article key={`${activity.created_at}-${activity.event_type}-${index}`} className={homeStyles.dashboardActivityItem}>
                    <span className={`${homeStyles.dashboardActivityIcon} ${activity.success ? homeStyles.activitySuccess : homeStyles.activityFailure}`}><ActivityIcon /></span>
                    <div><strong>{item.event}</strong><p>{item.detail}</p><time dateTime={activity.created_at}>{item.time}</time></div>
                    <span className={`${homeStyles.activityOutcome} ${activity.success ? homeStyles.outcomeSuccess : homeStyles.outcomeFailure}`}>{activity.success ? "Success" : "Failed"}</span>
                  </article>
                );
              })}
            </div>
          ) : stats ? (
            <div className={homeStyles.dashboardActivityEmpty}>
              <span><FiActivity /></span>
              <strong>No activity yet.</strong>
              <p>Your recent facial enrollment and verification activities will appear here when available.</p>
            </div>
          ) : (
            <div className={homeStyles.dashboardActivityEmpty}><p>Activity information is unavailable. Use Refresh to try again.</p></div>
          )}
        </article>
      </section>
    </main>
  );
}

export default function Dashboard() {
  const { user, updateProfile, isLoggedIn, checking } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const activeSection = ADMIN_SECTIONS.find(item => item.path === location.pathname);

  if (checking) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  if (user?.isAdmin) {
    if (isAdminRoute && location.pathname !== "/admin" && !activeSection) return <Navigate to="/admin" replace />;
    if (!isAdminRoute) return <Navigate to="/admin" replace />;
    return <AdminDashboard user={user} updateProfile={updateProfile} />;
  }
  if (isAdminRoute) return <Navigate to="/" replace />;
  return <Navigate to="/" replace />;
}