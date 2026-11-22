import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { apiSignup } from "../services/api.js";
import { getSafeInternalPath } from "../utils/navigation.js";
import styles from "./SignupForm.module.css";
import BrandLogo from "./BrandLogo.jsx";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const profilePoints = [
  [88, 59], [111, 54], [135, 57], [163, 57], [187, 54], [211, 59],
  [100, 82], [123, 80], [153, 82], [180, 80], [201, 82],
  [116, 113], [151, 119], [185, 113],
  [125, 146], [151, 153], [178, 146],
  [105, 179], [128, 187], [151, 190], [174, 187], [198, 179],
  [124, 220], [151, 229], [178, 220],
];
const profileEdges = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 6], [1, 7],
  [2, 7], [2, 8], [3, 8], [3, 9], [4, 9], [4, 10], [5, 10],
  [6, 11], [7, 11], [7, 12], [8, 12], [9, 12], [9, 13], [10, 13],
  [11, 14], [12, 14], [12, 15], [12, 16], [13, 16], [14, 17], [14, 18],
  [15, 18], [15, 19], [15, 20], [16, 20], [17, 21], [18, 21], [19, 21],
  [21, 22], [22, 23], [23, 24],
];

function IdentityVisual({ activeField, phase, completeFields, pageVisible }) {
  return (
    <aside
      className={styles.visualPanel}
      data-focus={activeField || "none"}
      data-phase={phase}
      data-visible={pageVisible}
      aria-label="Illustrative digital identity creation visual"
    >
      <div className={styles.ambientGlow} />
      <header className={styles.visualHeader}>
        <span><i /> COGNIFACE / PROFILE STUDIO</span>
        <span>IDENTITY 01</span>
      </header>

      <div className={styles.visualCopy}>
        <span>THE FIRST STEP</span>
        <h2>Your Identity.<br /><b>Your Digital Beginning.</b></h2>
        <p>A considered beginning for your facial recognition workspace.</p>
      </div>

      <div className={styles.identityScene}>
        <div className={styles.sceneGrid} />
        <div className={styles.sceneHalo} />
        <svg className={styles.faceIllustration} viewBox="0 0 300 280" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="signupFaceLine" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#35e6ac" />
              <stop offset="1" stopColor="#5c9bff" />
            </linearGradient>
          </defs>
          <path className={styles.faceOutline} d="M92 76c8-39 31-59 60-59 35 0 59 25 62 68l4 55c3 48-27 90-66 90-39 0-69-42-66-90l6-64Z" />
          <path className={styles.faceFeatures} d="M112 98c12-9 25-8 36 0m18 0c11-8 24-9 36 0m-53 20c-4 18-9 31-15 40 7 6 16 9 25 8m-24 22c14 9 28 9 42 0" />
          <path className={styles.faceMesh} d="m92 76 40 22 20-81 19 81 43-13m-132 49 50-36 20 48 19-48 43 40m-137 15 75-15 19 53 24-53 37 15m-127 30 55-45 21 53 23-53 47 45m-111 34 41-34 23 32 25-32 40 34" />
          <g className={styles.profileConnections}>
            {profileEdges.map(([from, to]) => (
              <line
                key={`${from}-${to}`}
                x1={profilePoints[from][0]}
                y1={profilePoints[from][1]}
                x2={profilePoints[to][0]}
                y2={profilePoints[to][1]}
              />
            ))}
          </g>
          <g className={styles.profileLandmarks}>
            {profilePoints.map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 4 === 0 ? 2.4 : 1.7} />)}
          </g>
        </svg>
        <span className={`${styles.cornerBracket} ${styles.cornerTL}`} />
        <span className={`${styles.cornerBracket} ${styles.cornerTR}`} />
        <span className={`${styles.cornerBracket} ${styles.cornerBL}`} />
        <span className={`${styles.cornerBracket} ${styles.cornerBR}`} />
        <span className={styles.sceneLine} />
        <div className={styles.sceneLabel}><span>IDENTITY PROFILE</span><b>ILLUSTRATIVE VISUAL</b></div>
      </div>

      <div className={styles.profileCard}>
        <span className={styles.profileAvatar}>
          {phase === "success" ? <FiCheck aria-hidden="true" /> : <FiUser aria-hidden="true" />}
        </span>
        <span className={styles.profileDetails}>
          <small>{phase === "success" ? "ACCOUNT STATUS" : "YOUR DIGITAL IDENTITY"}</small>
          <b>{phase === "success" ? "Account created" : "A new journey begins"}</b>
        </span>
        <span className={styles.profileMeter} aria-label={`${completeFields} of 3 account details entered`}>
          <b style={{ "--profile-progress": `${(completeFields / 3) * 100}%` }} />
        </span>
      </div>

      <div className={styles.visualFooter}>
        <span><FiShield aria-hidden="true" /> SECURE ACCOUNT CREATION</span>
        <span className={styles.visualStatus} data-status={phase}>
          {phase === "loading" ? "CREATING ACCOUNT" : phase === "success" ? "ACCOUNT CREATED" : phase === "error" ? "ACTION NEEDED" : "PROFILE PREVIEW"}
        </span>
      </div>
      <div className={styles.visualParticles} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    </aside>
  );
}

function getFriendlySignupError(error) {
  const message = typeof error?.message === "string" ? error.message : "";
  const normalized = message.toLowerCase();

  if (error?.status === 400 || normalized.includes("already registered")) {
    return "That email is already registered. Try signing in instead.";
  }
  if (error?.status === 422) {
    return "Please check your name, email address and password, then try again.";
  }
  if (error?.status >= 500) {
    return "Account creation is temporarily unavailable. Please try again.";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "We could not reach the sign-up service. Check your connection and try again.";
  }
  return message && message.length < 180
    ? message
    : "Unable to create your account right now. Please try again.";
}

function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = getSafeInternalPath(location.state?.returnTo);
  const loginState = returnTo ? { state: { returnTo } } : {};
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [phase, setPhase] = useState("idle");
  const [activeField, setActiveField] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === "visible");
  const successTimer = useRef(null);
  const resetTimer = useRef(null);
  const emailValid = emailPattern.test(email.trim());
  const completeFields = [fullName.trim(), emailValid ? email.trim() : "", password].filter(Boolean).length;

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(successTimer.current);
    window.clearTimeout(resetTimer.current);
  }, []);

  function updateField(field, value) {
    window.clearTimeout(resetTimer.current);
    if (field === "fullName") setFullName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    setFieldErrors(current => current[field] ? { ...current, [field]: "" } : current);
    setError("");
    if (phase === "error") setPhase("idle");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (phase === "loading" || phase === "success") return;
    window.clearTimeout(resetTimer.current);

    const nextErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Enter your full name.";
    if (!email.trim()) nextErrors.email = "Enter your email address.";
    else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Create a password.";
    if (!confirmPassword) nextErrors.confirmPassword = "Re-enter your password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Your passwords do not match.";

    setFieldErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) {
      setPhase("error");
      resetTimer.current = window.setTimeout(() => setPhase("idle"), 460);
      return;
    }

    setPhase("loading");
    try {
      await apiSignup(fullName.trim(), email.trim(), password);
      setPassword("");
      setConfirmPassword("");
      setPhase("success");
      successTimer.current = window.setTimeout(() => {
        navigate("/login", { replace: true, ...loginState });
      }, 1800);
    } catch (signupError) {
      setError(getFriendlySignupError(signupError));
      setPhase("error");
      resetTimer.current = window.setTimeout(() => setPhase("idle"), 500);
    }
  }

  if (phase === "success") {
    return (
      <main className={styles.page} data-phase="success" data-visible={pageVisible}>
        <IdentityVisual activeField="" phase={phase} completeFields={3} pageVisible={pageVisible} />
        <section className={styles.formPanel}>
          <div className={styles.formContent}>
            <Link to="/" className={styles.brand} aria-label="CogniFace home">
              <BrandLogo className={styles.brandLogo} alt="" />
            </Link>
            <div className={styles.successCard} role="status" aria-live="polite">
              <span className={styles.successIcon}><FiCheck aria-hidden="true" /><i /></span>
              <span className={styles.formEyebrow}>ACCOUNT CREATED</span>
              <h1>Your Account Is Ready.</h1>
              <p>Your account has been created successfully. You can now sign in and continue to your facial recognition workspace.</p>
              {email && <span className={styles.successEmail}>{email}</span>}
              <Link to="/login" {...loginState} className={styles.successButton}>
                Continue to Sign In <FiArrowRight aria-hidden="true" />
              </Link>
              <span className={styles.redirectNote}>Taking you to sign in...</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page} data-phase={phase} data-visible={pageVisible}>
      <IdentityVisual
        activeField={activeField}
        phase={phase}
        completeFields={completeFields}
        pageVisible={pageVisible}
      />

      <section className={styles.formPanel}>
        <div className={styles.formAmbient} aria-hidden="true"><i /><i /><i /></div>
        <div className={styles.formContent}>
          <Link to="/" className={styles.brand} aria-label="CogniFace home">
            <BrandLogo className={styles.brandLogo} alt="" />
          </Link>

          <div className={styles.headingBlock}>
            <span className={styles.formEyebrow}>CREATE YOUR ACCOUNT</span>
            <h1>Start Your Identity Journey.</h1>
            <p>Create your account to access your facial recognition workspace and explore intelligent identity verification.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {error && (
              <div className={styles.errorAlert} role="alert">
                <FiAlertTriangle aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="signup-name" className={styles.label}>Full Name</label>
              <div className={`${styles.inputShell} ${activeField === "fullName" ? styles.inputFocused : ""} ${fieldErrors.fullName ? styles.inputInvalid : ""}`}>
                <FiUser className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="signup-name"
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={fieldErrors.fullName ? "signup-name-error" : undefined}
                  onFocus={() => setActiveField("fullName")}
                  onBlur={() => setActiveField("")}
                  onChange={event => updateField("fullName", event.target.value)}
                />
              </div>
              {fieldErrors.fullName && <span id="signup-name-error" className={styles.fieldError}>{fieldErrors.fullName}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-email" className={styles.label}>Email Address</label>
              <div className={`${styles.inputShell} ${activeField === "email" ? styles.inputFocused : ""} ${fieldErrors.email ? styles.inputInvalid : ""} ${emailValid ? styles.inputValid : ""}`}>
                <FiMail className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="signup-email"
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                  onFocus={() => setActiveField("email")}
                  onBlur={() => setActiveField("")}
                  onChange={event => updateField("email", event.target.value)}
                />
                {emailValid && <span className={styles.validMark} aria-label="Valid email"><FiCheck /></span>}
              </div>
              {fieldErrors.email && <span id="signup-email-error" className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-password" className={styles.label}>Password</label>
              <div className={`${styles.inputShell} ${activeField === "password" ? styles.inputFocused : ""} ${fieldErrors.password ? styles.inputInvalid : ""}`}>
                <FiLock className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="signup-password"
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "signup-password-error" : "signup-password-hint"}
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
              {fieldErrors.password
                ? <span id="signup-password-error" className={styles.fieldError}>{fieldErrors.password}</span>
                : <span id="signup-password-hint" className={styles.fieldHint}>Choose a strong, unique password for your account.</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-confirm-password" className={styles.label}>Confirm Password</label>
              <div className={`${styles.inputShell} ${activeField === "confirmPassword" ? styles.inputFocused : ""} ${fieldErrors.confirmPassword ? styles.inputInvalid : ""}`}>
                <FiLock className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="signup-confirm-password"
                  className={styles.input}
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-error" : undefined}
                  onFocus={() => setActiveField("confirmPassword")}
                  onBlur={() => setActiveField("")}
                  onChange={event => updateField("confirmPassword", event.target.value)}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"}
                  aria-pressed={showConfirmation}
                  onClick={() => setShowConfirmation(value => !value)}
                >
                  {showConfirmation ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <span id="signup-confirm-error" className={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${styles[`button${phase[0].toUpperCase()}${phase.slice(1)}`]}`}
              disabled={phase === "loading"}
              aria-busy={phase === "loading"}
            >
              <span className={styles.buttonSheen} aria-hidden="true" />
              <span className={styles.buttonLabel}>{phase === "loading" ? "Creating Account..." : "Create Account"}</span>
              <span className={styles.buttonIcon} aria-hidden="true">
                {phase === "loading" ? <span className={styles.authSpinner}><i /><i /><i /></span> :
                  phase === "error" ? <FiAlertTriangle /> : <FiArrowRight />}
              </span>
            </button>
          </form>

          <div className={styles.loginPrompt}>
            <span>Already have an account?</span>
            <Link to="/login" {...loginState} className={styles.loginLink}>Sign in <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <p className={styles.passwordPolicy}>Your password is securely hashed by the application backend.</p>
        </div>
      </section>
    </main>
  );
}

export default SignupForm;
