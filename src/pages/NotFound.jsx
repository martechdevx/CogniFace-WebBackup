import { Link } from "react-router-dom";
import { FiArrowRight, FiHome, FiSearch } from "react-icons/fi";
import PublicFooter from "../Component/PublicFooter.jsx";
import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <>
      <main className={styles.notFound}>
        <section className={styles.errorFrame}>
          <div className={styles.errorCopy}>
            <span className={styles.eyebrow}><i /> COGNIFACE / ROUTE CHECK</span>
            <div className={styles.errorCode} aria-label="Error 404">4<span>0</span>4</div>
            <h1>This page isn&apos;t in our system.</h1>
            <p>
              The link may be outdated, or the address may have been entered incorrectly.
              Let&apos;s get you back to a page that exists.
            </p>
            <div className={styles.actions}>
              <Link to="/" className={styles.homeButton}><FiHome aria-hidden="true" /> Back to Home</Link>
              <Link to="/enrollment" className={styles.exploreLink}>Explore the platform <FiArrowRight aria-hidden="true" /></Link>
            </div>
          </div>

          <div className={styles.routeVisual} aria-hidden="true">
            <div className={styles.visualHeader}><span><i /> ROUTE STATUS</span><b>UNRESOLVED</b></div>
            <div className={styles.visualOrbit}>
              <span className={styles.orbitRing} />
              <span className={styles.orbitRing} />
              <span className={styles.orbitRing} />
              <span className={styles.orbitNode}><FiSearch /></span>
              <i className={styles.nodeOne} />
              <i className={styles.nodeTwo} />
              <i className={styles.nodeThree} />
            </div>
            <div className={styles.visualFooter}><span>REQUEST RECEIVED</span><b>NO MATCHING PAGE</b></div>
            <span className={styles.scanLine} />
          </div>
          <span className={styles.cornerCode}>CF / 404</span>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export default NotFound;
