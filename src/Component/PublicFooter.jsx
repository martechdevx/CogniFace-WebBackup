import { Link } from "react-router-dom";
import styles from "./PublicFooter.module.css";

function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <Link to="/" className={styles.brand}>CogniFace</Link>
      <nav aria-label="Footer navigation">
        <Link to="/">Home</Link>
        <Link to="/enrollment">Enrollment</Link>
        <Link to="/verification">Verification</Link>
        <Link to="/ourblog">Blog</Link>
      </nav>
      <span>© {new Date().getFullYear()} CogniFace</span>
    </footer>
  );
}

export default PublicFooter;
