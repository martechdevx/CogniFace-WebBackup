import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiAdminVerify, apiVerify } from "../../services/api.js";
import {
  FiAlertTriangle, FiArrowDown, FiArrowRight, FiCamera, FiCheck, FiCheckCircle,
  FiChevronDown, FiCpu, FiEye, FiImage, FiInfo, FiLayers, FiLoader, FiLock,
  FiRefreshCw, FiSearch, FiSun, FiUploadCloud, FiUser, FiX, FiXCircle, FiZap,
} from "react-icons/fi";
import PublicFooter from "../../Component/PublicFooter.jsx";
import LiveCamera from "../../Component/LiveCamera.jsx";
import maleFace from "../../assets/male-reference.jpg";
import femaleFace from "../../assets/female-reference.jpg";
import styles from "./Verify.module.css";
import publicStyles from "./VerifyPublic.module.css";

const verificationSteps = [
  { icon: FiImage, title: "Submit a Face Image", copy: "Upload a clear photograph of the person whose identity you want to check." },
  { icon: FiEye, title: "Face Detection", copy: "The system checks the submitted image and identifies the face that can be used for processing." },
  { icon: FiCpu, title: "Feature Extraction", copy: "The detected face is processed by the recognition model to generate a facial embedding." },
  { icon: FiSearch, title: "Identity Search", copy: "The generated facial embedding is compared against stored embeddings using the existing FAISS similarity search process." },
  { icon: FiCheckCircle, title: "Receive the Result", copy: "The system returns a possible matching identity or indicates that no sufficiently similar match was found." },
];

const matchingStages = [
  { icon: FiImage, title: "Submitted image", detail: "New face photo" },
  { icon: FiEye, title: "Face detection", detail: "Locate usable face" },
  { icon: FiCpu, title: "Embedding", detail: "Represent facial features" },
  { icon: FiSearch, title: "FAISS search", detail: "Search enrolled faces" },
  { icon: FiUser, title: "Possible match", detail: "Return a similar identity" },
];

const outcomes = [
  { icon: FiCheckCircle, number: "01", title: "Match Found", copy: "The system returned an enrolled identity with a sufficiently similar facial representation.", tone: "success" },
  { icon: FiInfo, number: "02", title: "No Match Found", copy: "The system did not return an enrolled identity that meets the required similarity criteria.", tone: "neutral" },
  { icon: FiAlertTriangle, number: "03", title: "Unable to Verify", copy: "The submitted image could not be processed successfully. This may happen when no usable face is detected or the image does not meet the processing requirements.", tone: "warning" },
];

const imageTips = [
  { icon: FiSun, title: "Good Lighting", copy: "Use an image where the face is properly illuminated." },
  { icon: FiEye, title: "Clear Face Visibility", copy: "Make sure the person's face is visible and not covered." },
  { icon: FiImage, title: "Avoid Blurry Images", copy: "Use a sharp photograph where the facial features can be seen clearly." },
  { icon: FiUser, title: "Suitable Face Angle", copy: "Choose an image where the face is positioned in a way that allows the system to detect it properly." },
  { icon: FiCamera, title: "One Usable Face", copy: "Make sure the intended person's face can be clearly identified in the image." },
];

const verificationFaqs = [
  ["What is face verification?", "Face verification is the process of comparing a submitted face image against facial identities already enrolled in the system to find a possible match."],
  ["Do I need to enroll my face before verification?", "The system needs enrolled facial identities to compare against. If you want your identity to be available for matching, you must complete enrollment first."],
  ["What happens if no match is found?", "The system returns a no-match result when it does not find an enrolled identity that meets the required similarity criteria."],
  ["What is FAISS?", "FAISS (Facebook AI Similarity Search) is a similarity-search library used to search through numerical vectors. In this application, it helps search stored facial embeddings for similar representations."],
  ["Can I verify without creating an account?", "You need an account to access the actual verification workspace and submit verification requests."],
  ["What happens if the image is unclear?", "If the system cannot detect or process a usable face, the verification request may fail and you may need to submit another image."],
  ["Does verification always identify someone?", "No. A verification request may return a possible match, no match or an error if the image cannot be processed. A result should be interpreted according to the application's matching process."],
];

function VerificationWorkspaceLink({ className, children }) {
  const { isLoggedIn } = useAuth();
  return (
    <Link
      to={isLoggedIn ? "/verification" : "/login"}
      state={isLoggedIn ? undefined : { returnTo: "/verification" }}
      className={className}
    >
      {children}
    </Link>
  );
}

function VerificationFace({ src, label, side }) {
  return (
    <div className={`${publicStyles.faceCard} ${side === "right" ? publicStyles.faceCardRight : ""}`}>
      <img src={src} alt="" aria-hidden="true" />
      <span className={publicStyles.faceLabel}>{label}</span>
      <span className={publicStyles.faceBrackets} aria-hidden="true"><i /><i /><i /><i /></span>
      <span className={publicStyles.faceLandmarks} aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>
    </div>
  );
}

function PublicVerificationPage() {
  const mainRef = useRef(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return undefined;
    const elements = root.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
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

  return (
    <main ref={mainRef} className={publicStyles.page}>
      <section className={publicStyles.hero}>
        <div className={publicStyles.heroCopy}>
          <span className={publicStyles.eyebrow}><i /> FACE IDENTITY MATCHING</span>
          <h1>Verify Identity Through <span>Facial Recognition.</span></h1>
          <p>Submit a face image and compare it against previously enrolled identities. Our facial recognition system processes the image and searches for a possible match, helping make identity verification simple and accessible.</p>
          <div className={publicStyles.heroActions}>
            <VerificationWorkspaceLink className={publicStyles.primaryButton}>Start Verification <span><FiArrowRight /></span></VerificationWorkspaceLink>
            <a className={publicStyles.secondaryButton} href="#how-it-works">How It Works <FiArrowDown /></a>
          </div>
          <div className={publicStyles.heroTrust}><span><FiLock /> Protected verification workspace</span><span><FiLayers /> Searches enrolled identities</span></div>
        </div>
        <div className={publicStyles.compareVisual} aria-label="Illustration of comparing an enrolled face with a newly submitted image; no verification request is performed">
          <div className={publicStyles.visualGrid} aria-hidden="true" />
          <span className={publicStyles.visualTag}><FiZap /> FACE COMPARISON</span>
          <div className={publicStyles.facesRow}>
            <VerificationFace src={femaleFace} label="ENROLLED IDENTITY" side="left" />
            <span className={publicStyles.compareConnector} aria-hidden="true"><i /><FiCpu /><i /></span>
            <VerificationFace src={maleFace} label="NEW IMAGE" side="right" />
          </div>
          <div className={publicStyles.compareSweep} aria-hidden="true" />
          <aside className={publicStyles.resultPanel}>
            <span className={publicStyles.panelTitle}><i /> VERIFICATION PROCESS</span>
            <strong>Comparing face features</strong>
            <span><FiCheck /> Image received</span>
            <span><FiCheck /> Face detected</span>
            <span className={publicStyles.processing}><i /> Comparing facial features</span>
            <small>Result pending · illustration only</small>
          </aside>
          <span className={publicStyles.visualNote}>Illustrative demonstration · no live verification</span>
        </div>
      </section>

      <section className={`${publicStyles.intro} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.introCopy}>
          <span className={publicStyles.sectionLabel}>THE IDEA, SIMPLY</span>
          <h2>What Is Face Verification?</h2>
          <p>Face verification is the process of comparing a submitted face image with facial identities that have already been enrolled in the system.</p>
          <p>When an image is submitted, the system detects the face and extracts its facial features. These features are converted into a numerical representation called a facial embedding.</p>
          <p>The generated embedding is then compared against stored facial embeddings to find a possible match. The result helps identify whether a similar enrolled facial identity exists in the system.</p>
        </div>
        <div className={publicStyles.introDiagram}>
          <span className={publicStyles.cardLabel}>SUBMITTED IMAGE TO POSSIBLE MATCH</span>
          <div className={publicStyles.introFlow}>
            {[[FiImage, "Submitted face"], [FiCpu, "Face embedding"], [FiSearch, "Enrolled identities"]].map(([Icon, title], index) => (
              <div className={publicStyles.introFlowItem} key={title}>
                <span><Icon /></span><strong>{title}</strong>
                {index < 2 && <FiArrowRight aria-hidden="true" />}
              </div>
            ))}
          </div>
          <p>Only identities already enrolled in the system can be returned as possible matches.</p>
        </div>
      </section>

      <section id="how-it-works" className={`${publicStyles.stepsSection} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.sectionHeading}>
          <span className={publicStyles.sectionLabel}>A CLEAR, CONNECTED PROCESS</span>
          <h2>How Face Verification Works</h2>
          <p>From submitting an image to receiving a possible identity match, the process follows a few clear steps.</p>
        </div>
        <div className={publicStyles.stepsGrid}>
          {verificationSteps.map(({ icon: Icon, title, copy }, index) => (
            <article key={title} className={publicStyles.stepCard} style={{ animationDelay: `${index * 100}ms` }}>
              <span className={publicStyles.stepNumber}>0{index + 1}</span>
              <span className={publicStyles.stepIcon}><Icon /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
              {index < verificationSteps.length - 1 && <FiArrowRight className={publicStyles.stepArrow} aria-hidden="true" />}
            </article>
          ))}
        </div>
      </section>

      <section className={`${publicStyles.matchSection} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.matchIntro}>
          <span className={publicStyles.sectionLabel}>INSIDE THE MATCHING PROCESS</span>
          <h2>How Does the System Find a Match?</h2>
          <p>When a new face image is submitted, the system generates a numerical representation of its facial features. This representation is compared with the facial embeddings already stored in the system.</p>
        </div>
        <div className={publicStyles.matchStages}>
          {matchingStages.map(({ icon: Icon, title, detail }, index) => (
            <article className={publicStyles.matchStage} key={title} style={{ animationDelay: `${index * 90}ms` }}>
              <span className={publicStyles.matchStageIcon}><Icon /></span>
              <b>0{index + 1}</b>
              <strong>{title}</strong>
              <small>{detail}</small>
              {index < matchingStages.length - 1 && <FiArrowRight className={publicStyles.matchStageArrow} aria-hidden="true" />}
            </article>
          ))}
        </div>
        <div className={publicStyles.searchIllustration}>
          <span className={publicStyles.searchLabel}><FiSearch /> SEARCHING ENROLLED REPRESENTATIONS</span>
          <div className={publicStyles.embeddingRows} aria-hidden="true">
            {[0, 1, 2, 3].map(row => (
              <div className={row === 1 ? publicStyles.embeddingRowActive : ""} key={row}>
                {Array.from({ length: 12 }, (_, col) => <i key={col} style={{ height: `${7 + ((row * 3 + col * 2) % 5) * 4}px` }} />)}
              </div>
            ))}
          </div>
          <span className={publicStyles.searchResult}><FiCheckCircle /> Similar representation retrieved</span>
          <p>FAISS searches stored facial embeddings and retrieves similar representations. Results depend on similarity; this illustration shows no actual search.</p>
        </div>
      </section>

      <section className={`${publicStyles.outcomesSection} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.sectionHeading}>
          <span className={publicStyles.sectionLabel}>POSSIBLE OUTCOMES</span>
          <h2>Understanding Verification Results</h2>
          <p>These are explanations of possible result states, not real verification records.</p>
        </div>
        <div className={publicStyles.outcomesGrid}>
          {outcomes.map(({ icon: Icon, number, title, copy, tone }) => (
            <article className={`${publicStyles.outcomeCard} ${publicStyles[tone]}`} key={title}>
              <span className={publicStyles.outcomeNumber}>{number}</span>
              <span className={publicStyles.outcomeIcon}><Icon /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
              {tone === "success" && <div className={publicStyles.sampleResult}><small>ILLUSTRATIVE EXAMPLE</small><span><FiUser /> Generic enrolled profile</span><b>Possible match</b></div>}
            </article>
          ))}
        </div>
      </section>

      <section className={`${publicStyles.tipsSection} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.sectionHeading}>
          <span className={publicStyles.sectionLabel}>A GOOD IMAGE HELPS</span>
          <h2>Start With a Clear Image.</h2>
          <p>The quality of the submitted image can affect how successfully the system detects and processes a face.</p>
        </div>
        <div className={publicStyles.tipsGrid}>
          {imageTips.map(({ icon: Icon, title, copy }) => (
            <article className={publicStyles.tipCard} key={title}>
              <span><Icon /></span><h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${publicStyles.connectionSection} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.connectionIntro}>
          <span className={publicStyles.sectionLabel}>TWO CONNECTED STEPS</span>
          <h2>Enrollment Comes First.</h2>
          <p>Face verification works by comparing a submitted face image with facial identities already registered in the system. This means an identity needs to be enrolled before it can be returned as a possible match.</p>
        </div>
        <div className={publicStyles.connectionCards}>
          <article>
            <span className={publicStyles.connectionIcon}><FiLayers /></span>
            <small>STEP 01 · ENROLLMENT</small>
            <h3>Face Enrollment</h3>
            <p>Register a facial identity and create its stored representation.</p>
            <Link to="/enrollment">Explore Enrollment <FiArrowRight /></Link>
          </article>
          <span className={publicStyles.connectionLine} aria-hidden="true"><i /></span>
          <article>
            <span className={publicStyles.connectionIcon}><FiSearch /></span>
            <small>STEP 02 · VERIFICATION</small>
            <h3>Face Verification</h3>
            <p>Submit another face image and search for a possible match.</p>
            <VerificationWorkspaceLink className={publicStyles.connectionAction}>Start Verification <FiArrowRight /></VerificationWorkspaceLink>
          </article>
        </div>
      </section>

      <section className={`${publicStyles.faqSection} ${publicStyles.section}`} data-reveal>
        <div className={publicStyles.faqIntro}>
          <span className={publicStyles.sectionLabel}>GOOD TO KNOW</span>
          <h2>Frequently Asked Questions</h2>
          <p>Answers to common questions about face verification.</p>
        </div>
        <div className={publicStyles.faqList}>
          {verificationFaqs.map(([question, answer]) => (
            <details className={publicStyles.faqItem} key={question}>
              <summary>{question}<FiChevronDown aria-hidden="true" /></summary>
              <div className={publicStyles.faqAnswer}><p>{answer}</p></div>
            </details>
          ))}
        </div>
      </section>

      <section className={publicStyles.finalCta} data-reveal>
        <div>
          <span className={publicStyles.sectionLabel}>YOUR NEXT STEP</span>
          <h2>Ready to Verify an Identity?</h2>
          <p>Access your verification workspace, submit a face image and search for a possible match among enrolled identities.</p>
        </div>
        <div className={publicStyles.finalActions}>
          <VerificationWorkspaceLink className={publicStyles.finalButton}>Start Verification <span><FiArrowRight /></span></VerificationWorkspaceLink>
          <Link className={publicStyles.finalLink} to="/enrollment">Learn About Face Enrollment</Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}

function Verify({ adminMode = false }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const searchAllFaces = adminMode || isAdmin;
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  if (!isLoggedIn && !adminMode) return <PublicVerificationPage />;

  const pick = (file) => {
    if (!file) return false;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg","jpeg","png"].includes(ext||"")) {
      setError("Please upload a JPG or PNG image.");
      setImageFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setResult(null);
      return false;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null); setError("");
    return true;
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const verify = async () => {
    if (!imageFile) { setError("Please select a face image first."); return; }
    setError(""); setResult(null); setLoading(true);
    try { setResult(await (searchAllFaces ? apiAdminVerify(imageFile) : apiVerify(imageFile))); }
    catch (e) {
      setError(e.message === "Failed to fetch"
        ? "Could not reach the verification service. Check your connection and try again."
        : e.message || "Verification could not be completed. Please try again.");
    }
    finally { setLoading(false); }
  };

  const scoreColor = (s) => s >= 85 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";

  if (!adminMode || isLoggedIn) {
    const matchedIdentity = result?.match_found ? result.best_match : null;
    const hasMatch = Boolean(matchedIdentity);
    const hasNoMatch = Boolean(result && !result.match_found);
    const unableToVerify = Boolean(error || (result?.match_found && !result.best_match));
    const score = matchedIdentity?.similarity_score;
    const hasScore = typeof score === "number" && Number.isFinite(score);
    const matchImageType = matchedIdentity?.image_base64?.startsWith("iVBOR") ? "image/png" : "image/jpeg";

    return (
      <main className={`${styles.workspacePage} ${adminMode ? styles.workspacePageEmbedded : ""}`}>
        {!adminMode && (
          <header className={styles.workspaceHeader}>
            <span className={styles.workspaceEyebrow}><i /> {searchAllFaces ? "SYSTEM-WIDE FACE SEARCH" : "YOUR ENROLLED PROFILES"}</span>
            <h1>Verify an Identity</h1>
            <p>{searchAllFaces
              ? "Upload a face image to search across all facial profiles enrolled in the system."
              : "Upload a face image to search only the facial profiles enrolled through your account."}</p>
          </header>
        )}

        <div className={`${styles.workspaceGrid} ${adminMode ? styles.workspaceGridEmbedded : ""}`}>
          <section className={styles.workspaceCard}>
            <header className={styles.workspaceCardHeader}>
              <span className={styles.workspaceSectionIcon}><FiCamera /></span>
              <div><h2>Upload a face image</h2><p>Select a JPG, JPEG, or PNG image to verify.</p></div>
            </header>

            <label
              className={`${styles.workspaceDropZone} ${dragOver ? styles.workspaceDropZoneActive : ""} ${preview ? styles.workspaceDropZoneHasImage : ""} ${loading ? styles.workspaceDropZoneBusy : ""}`}
              htmlFor="verification-image"
              onDragOver={event => { event.preventDefault(); if (!loading) setDragOver(true); }}
              onDragLeave={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false);
              }}
              onDrop={event => {
                event.preventDefault();
                setDragOver(false);
                if (!loading) pick(event.dataTransfer.files?.[0]);
              }}
              aria-busy={loading}
            >
              <input
                ref={fileRef}
                id="verification-image"
                className={styles.visuallyHidden}
                type="file"
                accept="image/jpeg,image/png"
                disabled={loading}
                onChange={event => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  pick(file);
                }}
              />
              {preview ? (
                <>
                  <img src={preview} alt="Selected image for verification" />
                  <span className={styles.workspaceImageOverlay}><FiCheck /> Image ready for verification</span>
                </>
              ) : (
                <span className={styles.workspaceDropPrompt}>
                  <FiUploadCloud />
                  <strong>{dragOver ? "Drop image to continue" : "Drop a face image here"}</strong>
                  <small>or choose a file from your device · JPG/JPEG/PNG</small>
                </span>
              )}
            </label>

            {error && <div className={styles.workspaceError} role="alert"><FiAlertTriangle /><span>{error}</span></div>}

            <div className={styles.workspaceActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => fileRef.current?.click()} disabled={loading}>
                <FiUploadCloud /> Upload Image
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => setCameraOpen(true)} disabled={loading}>
                <FiCamera /> Take a Photo
              </button>
              {preview && <button type="button" className={styles.textButton} onClick={reset} disabled={loading}><FiX /> Remove</button>}
              <button type="button" className={styles.primaryButton} onClick={verify} disabled={loading || !imageFile}>
                {loading ? <><FiLoader className={styles.workspaceSpinner} /> Verifying...</> : <><FiSearch /> Verify identity</>}
              </button>
            </div>

            <div className={styles.workspaceProcessNote}>
              <FiInfo />
              <p>{searchAllFaces
                ? "The recognition service detects the face, extracts its features, and searches all enrolled profiles."
                : "The recognition service detects the face, extracts its features, and searches only profiles enrolled through your account."}</p>
            </div>
            {loading && (
              <div className={styles.workspaceProcessing} role="status" aria-live="polite">
                <span className={styles.workspaceScanMark}><i /></span>
                <span><strong>Submitting image for verification</strong><small>The image is being prepared. The recognition service will detect the face, extract features, and search {searchAllFaces ? "all enrolled profiles" : "your enrolled profiles"}.</small></span>
              </div>
            )}
          </section>

          <section className={`${styles.workspaceCard} ${styles.workspaceResultCard}`} aria-live="polite">
            <header className={styles.workspaceCardHeader}>
              <span className={styles.workspaceSectionIcon}><FiSearch /></span>
              <div><h2>Verification result</h2><p>Results are shown after the backend completes the search.</p></div>
            </header>

            {!result && !error && !loading && (
              <div className={styles.workspaceEmptyResult}>
                <span><FiUser /></span>
                <strong>Ready when you are</strong>
                <p>Choose an image and start verification to see the result here.</p>
              </div>
            )}
            {loading && (
              <div className={styles.workspaceSearching}>
                <span className={styles.workspaceLargeSpinner}><FiLoader /></span>
                <strong>Verification in progress</strong>
                <p>Your image is being prepared and processed. The result will appear when the request completes.</p>
              </div>
            )}
            {hasMatch && (
              <div className={styles.workspaceMatchResult}>
                <div className={`${styles.workspaceResultBanner} ${styles.workspaceResultMatch}`}>
                  <FiCheckCircle />
                  <span><strong>MATCH FOUND</strong><small>{result.message}</small></span>
                </div>
                <div className={styles.workspaceIdentity}>
                  {matchedIdentity.image_base64 && <img src={`data:${matchImageType};base64,${matchedIdentity.image_base64}`} alt={`Matched identity: ${matchedIdentity.full_name}`} />}
                  <div><span>Matched identity</span><strong>{matchedIdentity.full_name}</strong></div>
                </div>
                <dl className={styles.workspaceMatchDetails}>
                  {matchedIdentity.matric_number && <div><dt>Student / staff ID</dt><dd>{matchedIdentity.matric_number}</dd></div>}
                  {matchedIdentity.program && <div><dt>Program / role</dt><dd>{matchedIdentity.program}</dd></div>}
                  {matchedIdentity.gender && <div><dt>Gender</dt><dd>{matchedIdentity.gender}</dd></div>}
                </dl>
                {hasScore && (
                  <div className={styles.workspaceScore}>
                    <div><span>Similarity score returned by the service</span><strong>{score}%</strong></div>
                    <span className={styles.workspaceScoreTrack}><i style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} /></span>
                  </div>
                )}
                <div className={styles.workspaceResultActions}>
                  <button type="button" className={styles.secondaryButton} onClick={reset}><FiRefreshCw /> Verify another image</button>
                  <Link to={searchAllFaces ? "/admin" : "/"} className={styles.textButton}>View Dashboard <FiArrowRight /></Link>
                </div>
              </div>
            )}
            {hasNoMatch && (
              <div className={styles.workspaceNoMatch}>
                <div className={`${styles.workspaceResultBanner} ${styles.workspaceResultNeutral}`}>
                  <FiInfo />
                  <span><strong>NO MATCH FOUND</strong><small>{result.message}</small></span>
                </div>
                <p>{searchAllFaces
                  ? "No enrolled profile in the system matched the submitted image."
                  : "No enrolled profile available to your account matched the submitted image."}</p>
                <div className={styles.workspaceResultActions}>
                  <button type="button" className={styles.secondaryButton} onClick={reset}><FiRefreshCw /> Verify another image</button>
                  <Link to={searchAllFaces ? "/admin/enrollments" : "/enrollment"} className={styles.textButton}>{searchAllFaces ? "View Enrollments" : "Go to Enrollment"} <FiArrowRight /></Link>
                </div>
              </div>
            )}
            {unableToVerify && !loading && (
              <div className={styles.workspaceUnableResult}>
                <div className={`${styles.workspaceResultBanner} ${styles.workspaceResultError}`}>
                  <FiAlertTriangle />
                  <span><strong>UNABLE TO VERIFY</strong><small>{error || result?.message || "The response did not include the expected match details."}</small></span>
                </div>
                <p>Try another clear face image. The service validates face detection and image clarity during processing.</p>
                <div className={styles.workspaceResultActions}>
                  <button type="button" className={styles.secondaryButton} onClick={reset}><FiRefreshCw /> Verify another image</button>
                  <Link to={searchAllFaces ? "/admin" : "/"} className={styles.textButton}>View Dashboard <FiArrowRight /></Link>
                </div>
              </div>
            )}
          </section>
        </div>
        {cameraOpen && <LiveCamera onCapture={pick} onClose={() => setCameraOpen(false)} />}
      </main>
    );
  }

  return (
    <div className={adminMode ? styles.adminPageEmbedded : styles.page}>
      {!adminMode && (
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/dashboard" className={styles.breadHome}>Dashboard</Link>
            <span className={styles.breadSep}>›</span>
            <span className={styles.breadCurrent}>Verification</span>
          </div>
          <h1 className={styles.title}>Identity Verification</h1>
          <p className={styles.sub}>
            Upload a photo to compare it with your enrolled face photos. The closest match and similarity score will be shown.
          </p>
        </header>
      )}
      {adminMode && (
        <p className={styles.sub}>
          Upload a photo to search across every enrolled face. The closest match and similarity score will be shown.
        </p>
      )}

      <div className={styles.grid}>
        {/* Left */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Upload Face Image</div>
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""} ${preview ? styles.dropZoneHasImage : ""} ${loading ? styles.dropZoneSearching : ""}`}
              aria-busy={loading}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
            >
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={e => pick(e.target.files[0])}/>
              {preview
                ? <img src={preview} alt="Query" className={styles.dropImage}/>
                : <>
                    <div className={styles.dropIcon}><FiUploadCloud size={40}/></div>
                    <div className={`${styles.dropTitle} ${dragOver ? styles.dropTitleActive : ""}`}>
                      {dragOver ? "Drop image here" : "Drag & drop or click to upload"}
                    </div>
                    <div className={styles.dropHint}>JPG, PNG supported</div>
                  </>
              }
              {loading && (
                <div className={styles.searchingOverlay} role="status" aria-live="polite">
                  <div className={styles.searchingBeam}/>
                  <div className={styles.searchingMessage}>
                    <FiLoader size={19}/>
                    <strong>{adminMode ? "Searching all enrolled faces..." : "Searching your enrolled faces..."}</strong>
                    {/* <span>Comparing against the face index...</span> */}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.btnRow}>
              <button onClick={() => fileRef.current?.click()} className={styles.btnGhost} style={{ flex:1 }}>
                <FiUploadCloud size={14}/> {preview ? "Change Image" : "Choose File"}
              </button>
              {preview && (
                <button onClick={reset} className={styles.btnDanger}><FiX size={14}/> Clear</button>
              )}
            </div>
          </div>

          {error && <div className={styles.alertError}><FiAlertTriangle size={14}/> {error}</div>}

          <button
            onClick={verify}
            disabled={loading || !imageFile}
            className={`${styles.btnPrimary} ${styles.btnFull}`}
          >
            {loading
              ? <><div className={styles.spinner} style={{ width:16, height:16, marginRight:0 }}/> {adminMode ? "Searching all enrolled faces..." : "Searching your enrolled faces..."}</>
              : <><FiSearch size={16}/> Run Verification</>}
          </button>

          <div className={styles.howBox}>
            <div className={styles.howTitle}><FiInfo size={13}/> How Verification Works</div>
            {[
              ["Upload","Add a clear photo of the person to check"],
              ["Encode","The AI converts the face into a vector fingerprint"],
              ["Search", adminMode ? "FAISS searches all enrolled face vectors" : "Search your enrolled face photos"],
              ["Match","The closest match and similarity score is returned"],
            ].map(([step, desc]) => (
              <div key={step} className={styles.howRow}>
                <span className={styles.howTag}>{step}</span>
                <span className={styles.howText}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Result */}
        <div className={`${styles.card} ${styles.cardFlex}`}>
          <div className={styles.cardTitle}>Verification Result</div>

          {!result && !loading && (
            <div className={styles.emptyState}>
              <FiSearch size={48} strokeWidth={1}/>
              <div>
                <div className={styles.emptyTitle}>No result yet</div>
                <div className={styles.emptyHint}>Upload an image and run verification to see matches</div>
              </div>
            </div>
          )}

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}/>
              <div>
                <div className={styles.loadingTitle}>{adminMode ? "Searching all enrolled faces..." : "Searching your enrolled faces..."}</div>
                <div className={styles.loadingHint}>Comparing against FAISS index</div>
              </div>
            </div>
          )}

          {result && (
            <div className={styles.resultAnim}>
              <div className={`${styles.matchBanner} ${result.match_found ? styles.matchBannerSuccess : styles.matchBannerFail}`}>
                <div className={`${styles.matchBannerIcon} ${result.match_found ? styles.matchBannerIconSuccess : styles.matchBannerIconFail}`}>
                  {result.match_found ? <FiCheckCircle size={20} color="#6ee7b7"/> : <FiXCircle size={20} color="#f87171"/>}
                </div>
                <div>
                  <div className={`${styles.matchBannerLabel} ${result.match_found ? styles.matchBannerLabelSuccess : styles.matchBannerLabelFail}`}>
                    {result.match_found ? "Match Found" : "No Match Found"}
                  </div>
                  <div className={styles.matchBannerMsg}>{result.message}</div>
                </div>
              </div>

              {result.match_found && result.best_match && (
                <>
                  <div className={styles.matchDetail}>
                    <img
                      src={`data:image/jpeg;base64,${result.best_match.image_base64}`}
                      alt="Enrolled face"
                      className={styles.matchImg}
                    />
                    <div>
                      <div className={styles.matchName}>{result.best_match.full_name}</div>
                      <div className={styles.matchBadges}>
                        {result.best_match.program && <span className={styles.matchBadge}>{result.best_match.program}</span>}
                        {result.best_match.gender && <span className={styles.matchSubtext}>{result.best_match.gender}</span>}
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailTable}>
                    {[
                      { k:"Full Name",  v:result.best_match.full_name },
                      result.best_match.matric_number && { k:"Matric No.", v:result.best_match.matric_number },
                      result.best_match.gender  && { k:"Gender",  v:result.best_match.gender },
                      result.best_match.program && { k:"Program", v:result.best_match.program },
                    ].filter(Boolean).map(r => (
                      <div key={r.k} className={styles.detailRow}>
                        <span className={styles.detailKey}>{r.k}</span>
                        <span className={styles.detailVal}>{r.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.scoreBox} style={{
                    background: scoreColor(result.best_match.similarity_score) + "10",
                    border:`1.5px solid ${scoreColor(result.best_match.similarity_score)}33`,
                  }}>
                    <div className={styles.scoreTop}>
                      <span className={styles.scoreLabel}>Similarity Score</span>
                      <span className={styles.scoreValue} style={{ color:scoreColor(result.best_match.similarity_score) }}>
                        {result.best_match.similarity_score}%
                      </span>
                    </div>
                    <div className={styles.scoreBar}>
                      <div className={styles.scoreBarFill} style={{
                        width:`${result.best_match.similarity_score}%`,
                        background:`linear-gradient(90deg,${scoreColor(result.best_match.similarity_score)}88,${scoreColor(result.best_match.similarity_score)})`,
                      }}/>
                    </div>
                    <div className={styles.scoreHint}>
                      {result.best_match.similarity_score >= 85 ? "High confidence match" :
                       result.best_match.similarity_score >= 70 ? "Moderate confidence — review recommended" :
                       "Low confidence — manual verification advised"}
                    </div>
                  </div>
                </>
              )}

              <button onClick={reset} className={`${styles.btnGhost} ${styles.resetBtn}`}>
                <FiRefreshCw size={14}/> Run Another Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Verify;