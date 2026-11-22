import { lazy, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaFingerprint,
  FaLock,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";
import maleFace from "../assets/male-reference.jpg";
import femaleFace from "../assets/female-reference.jpg";
import { useAuth } from "../context/AuthContext.jsx";
import PublicFooter from "../Component/PublicFooter.jsx";
import styles from "./Home.module.css";

const UserDashboard = lazy(() => import("./dashboard/dashboard.jsx").then(module => ({ default: module.UserDashboard })));

const platformFeatures = [
  {
    number: "01",
    icon: FaUserPlus,
    title: "Face Enrollment",
    copy: "Register your identity with the required details and clear facial images. The backend processes each image and creates a face representation for matching.",
    to: "/enrollment",
    action: "Explore Enrollment",
  },
  {
    number: "02",
    icon: FaFingerprint,
    title: "Face Verification",
    copy: "Submit a face image and compare it with enrolled identities to return a possible match and its similarity score.",
    to: "/verification",
    action: "Explore Verification",
  },
  {
    number: "03",
    icon: FaShieldAlt,
    title: "Technology Blog",
    copy: "Read about facial recognition, computer vision, identity verification, and the technology behind the CogniFace workflow.",
    to: "/ourblog",
    action: "Explore Blog",
  },
];

const workflow = [
  ["01", "Create your identity", "Submit your personal details and one to three face images."],
  ["02", "Build your face profile", "The system detects a face and extracts its features to generate an embedding."],
  ["03", "Verify an identity", "Upload another face image and search for a possible match in enrolled records."],
];

function FaceDemo() {
  const [subject, setSubject] = useState("male");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSubject(current => current === "male" ? "female" : "male");
    }, 6800);
    return () => window.clearInterval(timer);
  }, []);

  const isMale = subject === "male";

  return (
    <div className={`${styles.faceStage} ${isMale ? styles.maleStage : styles.femaleStage}`}>
      <img
        className={`${styles.demoFace} ${styles.demoFaceMale} ${isMale ? styles.faceActive : ""}`}
        src={maleFace}
        alt=""
        aria-hidden="true"
      />
      <img
        className={`${styles.demoFace} ${styles.demoFaceFemale} ${!isMale ? styles.faceActive : ""}`}
        src={femaleFace}
        alt=""
        aria-hidden="true"
      />
      <div key={subject} className={styles.scanEffects} aria-hidden="true">
        <div className={styles.scanGrid} />
        <div className={styles.detectionFrame}><i /><i /><i /><i /></div>
        <div className={styles.scanLine} />
        <div className={styles.landmarks}>
          {Array.from({ length: 19 }, (_, index) => <i key={index} />)}
        </div>
      </div>
      <aside key={`panel-${subject}`} className={styles.resultPanel} aria-label="Facial analysis demonstration">
        <div className={styles.resultTop}>
          <span><b /> FACIAL ANALYSIS</span>
          <small>DEMO</small>
        </div>
        <strong>Face detected</strong>
        <div className={styles.analysisGraph} aria-hidden="true">
          <svg viewBox="0 0 220 70" role="presentation">
            <path d="M4 54 C28 53 24 28 51 30 S76 56 101 49 S132 16 153 26 S180 55 216 12" />
            <circle cx="51" cy="30" r="3" /><circle cx="101" cy="49" r="3" /><circle cx="153" cy="26" r="3" /><circle cx="216" cy="12" r="3" />
          </svg>
        </div>
        <div className={styles.resultRows}>
          <span><small>Landmarks</small><b>Visualized</b></span>
          <span><small>Embedding</small><b>Illustrative</b></span>
          <span><small>Status</small><b>Demonstration</b></span>
        </div>
      </aside>
      <div className={styles.demoLabel}><FaBolt /> Supplied photo demonstration — not a live camera</div>
    </div>
  );
}

function Home() {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return undefined;
    const elements = root.querySelectorAll("[data-reveal]");
    if (typeof IntersectionObserver === "undefined") {
      elements.forEach(element => { element.dataset.reveal = "shown"; });
      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.reveal = "shown";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  if (isLoggedIn) {
    return (
      <div className={styles.home}>
        <UserDashboard key={location.key} user={user} />
        <PublicFooter />
      </div>
    );
  }

  return (
    <main ref={mainRef} className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroFrame}>
          <FaceDemo />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}><i /> AI IDENTITY PLATFORM</span>
              <h1>Your Face.<br />Your Identity.<br /><span>Verified.</span></h1>
              <p>
                A smarter way to enroll and verify identities using facial recognition
                technology. Register your face, perform identity checks and experience
                intelligent face matching through one simple platform.
              </p>
              <div className={styles.heroActions}>
                <Link to="/enrollment" className={styles.primaryButton}>
                  Start Enrollment <span><FaArrowRight /></span>
                </Link>
                <Link to="/verification" className={styles.textButton}>
                  Explore Verification <FaArrowRight />
                </Link>
              </div>
              <div className={styles.heroProof}>
                <span><FaLock /> Protected session access</span>
                <span><FaFingerprint /> InsightFace + FAISS matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.introSection} id="about" data-reveal>
        <span className={styles.sectionLabel}><i /> THE COGNIFACE PLATFORM</span>
        <div className={styles.introGrid}>
          <h2>Everything starts with your face.</h2>
          <p>
            CogniFace brings face enrollment and identity verification together in one
            platform. Create your facial identity profile and use it when you need to
            verify a person&apos;s identity.
          </p>
        </div>
        <div className={styles.introFoot}>
          <span>ENROLLMENT</span><i /><span>FACE FEATURES</span><i /><span>VERIFICATION</span>
        </div>
      </section>

      <section className={styles.platformSection} id="platform" data-reveal>
        <div className={styles.sectionHeading}>
          <div><span className={styles.sectionLabel}>EXPLORE THE PLATFORM</span><h2>Identity tools, connected.</h2></div>
          <p>Explore the public guides, then sign in to use the protected workspace features.</p>
        </div>
        <div className={styles.featureGrid}>
          {platformFeatures.map(feature => {
            const Icon = feature.icon;
            return (
              <article key={feature.number}>
                <span className={styles.featureNumber}>{feature.number}</span>
                <span className={styles.featureIcon}><Icon /></span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
                <Link to={feature.to}>{feature.action}<FaArrowRight /></Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.workflowSection} id="how-it-works" data-reveal>
        <div className={styles.workflowHeading}>
          <span className={styles.sectionLabel}>HOW IT WORKS</span>
          <h2>From enrollment to verification.</h2>
          <p>A practical view of the existing face-processing workflow.</p>
        </div>
        <div className={styles.workflowSteps}>
          {workflow.map(([number, title, copy], index) => (
            <article key={number} style={{ "--step-index": index }}>
              <span className={styles.stepNumber}>{number}</span>
              <div className={styles.stepIcon}>{index === 0 ? <FaUserPlus /> : index === 1 ? <FaFingerprint /> : <FaCheck />}</div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.technologyStrip} data-reveal>
        <div><span className={styles.sectionLabel}>BUILT WITH THE PROJECT&apos;S ACTUAL STACK</span><h2>Clear steps. Real backend results.</h2></div>
        <div className={styles.stackList} aria-label="Application technologies">
          {["React", "FastAPI", "InsightFace", "FAISS"].map(item => <span key={item}>{item}</span>)}
        </div>
        <p>Enrollment and verification requests are processed by the authenticated application backend.</p>
      </section>

      <section className={styles.finalSection} data-reveal>
        <div><span className={styles.sectionLabel}>READY TO GET STARTED?</span><h2>Explore your facial recognition workspace.</h2><p>Create an account to begin enrollment and access identity verification.</p></div>
        <Link to="/signup" className={styles.finalButton}>Get Started <span><FaArrowRight /></span></Link>
      </section>

      <PublicFooter />
    </main>
  );
}

export default Home;
