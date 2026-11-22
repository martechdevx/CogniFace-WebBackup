import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiLogin } from "../services/api.js";
import { getSafeInternalPath } from "../utils/navigation.js";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import styles from "./LoginForm.module.css";
import BrandLogo from "./BrandLogo.jsx";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const landmarks = [
  [88, 59], [111, 54], [135, 57], [163, 57], [187, 54], [211, 59],
  [100, 82], [123, 80], [153, 82], [180, 80], [201, 82],
  [116, 113], [151, 119], [185, 113],
  [125, 146], [151, 153], [178, 146],
  [105, 179], [128, 187], [151, 190], [174, 187], [198, 179],
  [124, 220], [151, 229], [178, 220],
];
const landmarkEdges = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 6], [1, 7],
  [2, 7], [2, 8], [3, 8], [3, 9], [4, 9], [4, 10], [5, 10],
  [6, 11], [7, 11], [7, 12], [8, 12], [9, 12], [9, 13], [10, 13],
  [11, 14], [12, 14], [12, 15], [12, 16], [13, 16], [14, 17], [14, 18],
  [15, 18], [15, 19], [15, 20], [16, 20], [17, 21], [18, 21], [19, 21],
  [21, 22], [22, 23], [23, 24],
];

function FaceVisual({ activeField, phase, emailValid, pageVisible }) {
  const fieldState = activeField === "password" ? "password" : activeField === "email" || emailValid ? "email" : "none";
  const displayState = phase === "loading" ? "processing" : phase === "success" ? "confirmed" : phase === "error" ? "retry" : fieldState;

  return (
    <aside
      className={styles.visualPanel}
      data-focus={fieldState}
      data-phase={phase}
      data-visible={pageVisible}
      aria-label="Illustrative facial landmark visual"
    >
      <div className={styles.visualAmbient} />
      <div className={styles.visualHeader}>
        <span className={styles.visualBrand}><i /> COGNIFACE / IDENTITY</span>
        <span className={styles.visualIndex}>SYSTEM 01</span>
      </div>

      <div className={styles.visualTitle}>
        <span>SECURE ACCESS,</span>
        <strong>designed around you.</strong>
      </div>

      <div className={styles.faceScene}>
        <div className={styles.sceneGrid} />
        <div className={styles.sceneAura} />
        <svg className={styles.faceSvg} viewBox="0 0 300 280" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="faceLine" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#35e6ac" />
              <stop offset="1" stopColor="#5c9bff" />
            </linearGradient>
          </defs>
          <path
            className={styles.faceOutline}
            d="M92 76c8-39 31-59 60-59 35 0 59 25 62 68l4 55c3 48-27 90-66 90-39 0-69-42-66-90l6-64Z"
          />
          <path className={styles.faceFeatures} d="M112 98c12-9 25-8 36 0m18 0c11-8 24-9 36 0m-53 20c-4 18-9 31-15 40 7 6 16 9 25 8m-24 22c14 9 28 9 42 0" />
          <path className={styles.faceMesh} d="m92 76 40 22 20-81 19 81 43-13m-132 49 50-36 20 48 19-48 43 40m-137 15 75-15 19 53 24-53 37 15m-127 30 55-45 21 53 23-53 47 45m-111 34 41-34 23 32 25-32 40 34" />
          <g className={styles.landmarkConnections}>
            {landmarkEdges.map(([from, to]) => (
              <line
                key={`${from}-${to}`}
                x1={landmarks[from][0]}
                y1={landmarks[from][1]}
                x2={landmarks[to][0]}
                y2={landmarks[to][1]}
              />
            ))}
          </g>
          <g className={styles.landmarkPoints}>
            {landmarks.map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 4 === 0 ? 2.4 : 1.7} />)}
          </g>
        </svg>
        <span className={`${styles.scanBracket} ${styles.bracketTopLeft}`} />
        <span className={`${styles.scanBracket} ${styles.bracketTopRight}`} />
        <span className={`${styles.scanBracket} ${styles.bracketBottomLeft}`} />
        <span className={`${styles.scanBracket} ${styles.bracketBottomRight}`} />
        <div className={styles.scanBeam} />
        <div className={styles.scanCaption}>
          <span>FACIAL LANDMARKS</span>
          <b>ILLUSTRATIVE VISUAL</b>
        </div>
      </div>

      <div className={styles.statusCard}>
        <span className={styles.statusIcon}>{phase === "success" ? <FiCheck /> : <FiShield />}</span>
        <span>
          <small>{phase === "success" ? "ACCESS STATUS" : "IDENTITY STARTS WITH YOU"}</small>
          <b>{phase === "success" ? "Access confirmed" : "Your workspace, securely."}</b>
        </span>
        <i className={styles.statusPulse} />
      </div>

      <div className={styles.visualFooter}>
        <span><FiLock aria-hidden="true" /> HTTPONLY SESSION COOKIES</span>
        <span className={styles.visualState} data-state={displayState}>
          {displayState === "processing" ? "REQUEST IN PROGRESS" :
            displayState === "confirmed" ? "ACCESS GRANTED" :
              displayState === "retry" ? "RETRY AVAILABLE" :
                displayState === "password" ? "SECURE ENTRY" :
                  displayState === "email" ? "IDENTITY ENTRY" : "VISUAL PREVIEW"}
        </span>
      </div>
      <div className={styles.visualSpecks} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    </aside>
  );
}

function getFriendlyLoginError(error) {
  const message = typeof error?.message === "string" ? error.message : "";
  const normalized = message.toLowerCase();

  if (error?.status === 401 || normalized.includes("invalid email or password")) {
    return "Invalid email or password. Check your details and try again.";
  }
  if (error?.status === 403 || normalized.includes("not authorized")) {
    return "This account is not authorized for administrator access.";
  }
  if (normalized.includes("backend did not respond") || normalized.includes("unable to reach the backend")) {
    return "We could not reach the sign-in service. Check your connection and try again.";
  }
  if (error?.status >= 500) {
    return "Sign in is temporarily unavailable. Please try again.";
  }
  return message && message.length < 180
    ? message
    : "Unable to sign in right now. Please try again.";
}

function LoginForm() {
  const { login, isLoggedIn, checking } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = getSafeInternalPath(location.state?.returnTo);
  const destination = returnTo || "/";
  const adminDestination = returnTo === "/admin" || returnTo?.startsWith("/admin/")
    ? returnTo
    : "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [phase, setPhase] = useState("idle");
  const [activeField, setActiveField] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === "visible");
  const successTimer = useRef(null);
  const resetTimer = useRef(null);
  const emailValid = emailPattern.test(email.trim());

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(successTimer.current);
    window.clearTimeout(resetTimer.current);
  }, []);

  useEffect(() => {
    if (!checking && isLoggedIn && phase !== "success") {
      navigate(destination, { replace: true });
    }
  }, [checking, destination, isLoggedIn, navigate, phase]);

  function updateField(field, value) {
    window.clearTimeout(resetTimer.current);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    setFieldErrors(current => current[field] ? { ...current, [field]: "" } : current);
    setError("");
    if (phase === "error") setPhase("idle");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (phase === "loading" || phase === "success") return;
    window.clearTimeout(resetTimer.current);

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email address.";
    else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Enter your password.";

    setFieldErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) {
      setPhase("error");
      resetTimer.current = window.setTimeout(() => setPhase("idle"), 460);
      return;
    }

    setPhase("loading");
    try {
      const data = await apiLogin(email.trim(), password, adminMode);
      login(data, adminMode, returnTo, true);
      setPhase("success");
      successTimer.current = window.setTimeout(() => {
        navigate(adminMode ? adminDestination : destination, { replace: true });
      }, 820);
    } catch (loginError) {
      setError(getFriendlyLoginError(loginError));
      setPhase("error");
      resetTimer.current = window.setTimeout(() => setPhase("idle"), 500);
    }
  }

  if (checking || (isLoggedIn && phase !== "success")) {
    return (
      <main className={styles.sessionRedirect} aria-live="polite">
        <div className={styles.sessionRedirectOrb}><span /></div>
        <p>{checking ? "Checking your secure session..." : "Opening your workspace..."}</p>
      </main>
    );
  }

  return (
    <main className={styles.page} data-phase={phase} data-visible={pageVisible}>
      <section className={styles.formPanel}>
        <div className={styles.formAmbient} aria-hidden="true"><i /><i /><i /></div>
        <div className={styles.formContent}>
          <Link to="/" className={styles.brand} aria-label="CogniFace home">
            <BrandLogo className={styles.brandLogo} alt="" />
          </Link>

          <div className={styles.headingBlock}>
            <span className={styles.welcome}>WELCOME BACK</span>
            <h1>Good to See You Again.</h1>
            <p>Sign in to access your facial recognition workspace and continue where you left off.</p>
          </div>

          <div className={styles.authMode} role="group" aria-label="Sign-in type">
            <button
              type="button"
              className={`${styles.modeButton} ${!adminMode ? styles.modeActive : ""}`}
              aria-pressed={!adminMode}
              onClick={() => { setAdminMode(false); setError(""); }}
            >
              <FiUser aria-hidden="true" /> User
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${adminMode ? styles.modeActive : ""}`}
              aria-pressed={adminMode}
              onClick={() => { setAdminMode(true); setError(""); }}
            >
              <FiShield aria-hidden="true" /> Admin
            </button>
          </div>

          {adminMode && <p className={styles.adminNote}>Use your authorized administrator account.</p>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {error && (
              <div className={styles.errorAlert} role="alert">
                <FiAlertTriangle aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="login-email" className={styles.label}>Email Address</label>
              <div className={`${styles.inputShell} ${activeField === "email" ? styles.inputFocused : ""} ${fieldErrors.email ? styles.inputInvalid : ""} ${emailValid ? styles.inputValid : ""}`}>
                <FiMail className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="login-email"
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                  onFocus={() => setActiveField("email")}
                  onBlur={() => setActiveField("")}
                  onChange={event => updateField("email", event.target.value)}
                />
                {emailValid && <span className={styles.validMark} aria-label="Valid email"><FiCheck /></span>}
              </div>
              {fieldErrors.email && <span id="login-email-error" className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="login-password" className={styles.label}>Password</label>
                <a href="#" className={styles.forgotLink} onClick={event => event.preventDefault()}>Forgot Password?</a>
              </div>
              <div className={`${styles.inputShell} ${activeField === "password" ? styles.inputFocused : ""} ${fieldErrors.password ? styles.inputInvalid : ""}`}>
                <FiLock className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="login-password"
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField("")}
                  onChange={event => updateField("password", event.target.value)}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(value => !value)}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.password && <span id="login-password-error" className={styles.fieldError}>{fieldErrors.password}</span>}
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${styles[`button${phase[0].toUpperCase()}${phase.slice(1)}`]}`}
              disabled={phase === "loading" || phase === "success"}
              aria-busy={phase === "loading"}
            >
              <span className={styles.buttonSheen} aria-hidden="true" />
              <span className={styles.buttonLabel}>
                {phase === "loading" ? "Authenticating..." : phase === "success" ? "Login Successful" : "Sign In"}
              </span>
              <span className={styles.buttonIcon} aria-hidden="true">
                {phase === "loading" ? <span className={styles.authSpinner}><i /><i /><i /></span> :
                  phase === "success" ? <FiCheck /> :
                    phase === "error" ? <FiAlertTriangle /> : <FiArrowRight />}
              </span>
              <span className={styles.successRipple} aria-hidden="true" />
            </button>
          </form>

          <div className={styles.signupPrompt}>
            <span>Don&apos;t have an account?</span>
            <Link to="/signup" state={location.state} className={styles.signupLink}>Create an account <FiArrowRight aria-hidden="true" /></Link>
          </div>

          <div className={styles.formSecurity}><FiLock aria-hidden="true" /> Your session is protected with secure HttpOnly cookies.</div>
        </div>
      </section>

      <FaceVisual
        activeField={activeField}
        phase={phase}
        emailValid={emailValid}
        pageVisible={pageVisible}
      />
    </main>
  );
}

export default LoginForm;
