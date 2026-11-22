import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCpu,
  FiEye,
  FiImage,
  FiLayers,
  FiMail,
  FiSearch,
  FiShield,
  FiTarget,
} from "react-icons/fi";
import PublicFooter from "../Component/PublicFooter.jsx";
import NotFound from "./NotFound.jsx";
import styles from "./Blog.module.css";

const articles = [
  {
    slug: "understanding-facial-recognition-technology",
    category: "Facial Recognition",
    title: "Understanding Facial Recognition Technology",
    excerpt:
      "A clear introduction to how a face image becomes a machine-readable representation, and how systems use those representations to compare identities.",
    readTime: "5 min read",
    artwork: "Face",
    icon: FiTarget,
    keywords: "recognition identity matching face features",
  },
  {
    slug: "computer-vision-and-faces",
    category: "Computer Vision",
    title: "How Computer Vision Helps Machines Understand Faces",
    excerpt:
      "Explore how computer vision locates faces, interprets visual information and prepares an image for later recognition tasks.",
    readTime: "4 min read",
    artwork: "Vision",
    icon: FiEye,
    keywords: "image pixels detection landmarks artificial intelligence",
  },
  {
    slug: "what-is-a-facial-embedding",
    category: "Facial Recognition",
    title: "What Is a Facial Embedding?",
    excerpt:
      "Learn how a recognition model can encode facial features as a numerical vector that can be compared with other vectors.",
    readTime: "4 min read",
    artwork: "Embedding",
    icon: FiLayers,
    keywords: "vector features model representation",
  },
  {
    slug: "face-detection-vs-face-recognition",
    category: "Computer Vision",
    title: "Face Detection vs Face Recognition: Understanding the Difference",
    excerpt:
      "Detection answers where a face appears in an image; recognition compares facial representations. Here is how the two tasks differ.",
    readTime: "5 min read",
    artwork: "Detection",
    icon: FiTarget,
    keywords: "locate identify comparison computer vision",
  },
  {
    slug: "ai-and-identity-verification",
    category: "Identity Verification",
    title: "How AI Is Changing Identity Verification",
    excerpt:
      "A practical look at how automated image analysis can support identity workflows, along with the importance of careful review and clear limitations.",
    readTime: "5 min read",
    artwork: "Identity",
    icon: FiShield,
    keywords: "artificial intelligence systems responsible",
  },
  {
    slug: "understanding-similarity-search",
    category: "Artificial Intelligence",
    title: "Understanding Similarity Search in Facial Recognition Systems",
    excerpt:
      "See how systems compare numerical representations and retrieve nearby candidates without treating similarity as proof of identity.",
    readTime: "6 min read",
    artwork: "Search",
    icon: FiCpu,
    keywords: "nearest neighbors vectors matching distance",
  },
  {
    slug: "image-quality-in-facial-recognition",
    category: "Facial Recognition",
    title: "The Role of Image Quality in Facial Recognition",
    excerpt:
      "Lighting, blur, framing and occlusion can affect what information is available to a recognition model. Learn what makes an image easier to process.",
    readTime: "4 min read",
    artwork: "Quality",
    icon: FiImage,
    keywords: "lighting clarity focus capture photo",
  },
  {
    slug: "introduction-to-faiss",
    category: "Technology",
    title: "An Introduction to FAISS and Vector Similarity Search",
    excerpt:
      "Understand the basic idea behind FAISS: indexing vectors so a system can search for close matches in a collection of numerical representations.",
    readTime: "5 min read",
    artwork: "Faiss",
    icon: FiCpu,
    keywords: "index nearest neighbor vector database",
  },
];

const categories = [
  "All Articles",
  "Facial Recognition",
  "Computer Vision",
  "Artificial Intelligence",
  "Identity Verification",
  "Technology",
];

function HeroVisual() {
  return (
    <div className={styles.heroVisual} role="img" aria-label="Illustration of facial landmarks and connected recognition data">
      <div className={styles.heroVisualTop}>
        <span><i /> IDENTITY / 01</span>
        <span>VISUAL SYSTEMS</span>
      </div>
      <svg className={styles.faceIllustration} viewBox="0 0 440 380" aria-hidden="true">
        <defs>
          <linearGradient id="faceStroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#35e6ac" />
            <stop offset="1" stopColor="#5c9bff" />
          </linearGradient>
          <radialGradient id="faceGlow">
            <stop offset="0" stopColor="#35d6e8" stopOpacity=".23" />
            <stop offset="1" stopColor="#35d6e8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="224" cy="177" r="155" fill="url(#faceGlow)" />
        <path className={styles.faceContour} d="M143 90c19-32 48-49 83-49 55 0 94 42 94 105v38c0 74-43 133-99 133s-99-59-99-133v-38c0-22 7-41 21-56Z" />
        <path className={styles.faceFeature} d="M170 152c12-10 26-10 38-1M239 151c12-10 26-10 38 1M218 157c-5 25-11 45-18 59 8 7 18 10 29 8M194 247c17 10 37 10 54 0" />
        <path className={styles.faceMesh} d="m148 101 39 47 39-55 43 57 42-46M126 154l61-6 39 48 43-47 55 6M121 205l66-57-1 75 40-27 43 28-2-76 61 57M139 254l48-31 39 0 43 1 43 30M164 289l23-66 39 36 42-36 23 66" />
        <g className={styles.faceNodes}>
          <circle cx="148" cy="101" r="4" /><circle cx="187" cy="148" r="4" /><circle cx="226" cy="93" r="4" />
          <circle cx="269" cy="150" r="4" /><circle cx="311" cy="104" r="4" /><circle cx="126" cy="154" r="4" />
          <circle cx="226" cy="196" r="4" /><circle cx="355" cy="160" r="4" /><circle cx="121" cy="205" r="4" />
          <circle cx="186" cy="223" r="4" /><circle cx="268" cy="224" r="4" /><circle cx="347" cy="205" r="4" />
          <circle cx="139" cy="254" r="4" /><circle cx="226" cy="259" r="4" /><circle cx="312" cy="254" r="4" />
        </g>
        <path className={styles.faceCrosshair} d="M220 20v24m0 272v24M66 176h25m266 0h25" />
      </svg>
      <div className={styles.visualReadout}><span>FEATURE MAP</span><b>STRUCTURE / SIGNAL / CONTEXT</b></div>
      <div className={styles.visualScan} aria-hidden="true" />
    </div>
  );
}

function ArticleArtwork({ article, featured = false }) {
  const Icon = article.icon;
  return (
    <div
      className={`${styles.articleArtwork} ${styles[`artwork${article.artwork}`]} ${featured ? styles.featuredArtwork : ""}`}
      role="img"
      aria-label={`Editorial illustration for ${article.title}`}
    >
      <span className={styles.artworkIndex}>CF / {String(articles.indexOf(article) + 1).padStart(2, "0")}</span>
      <div className={styles.artworkLines} aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className={styles.artworkCore}><Icon aria-hidden="true" /></div>
      <svg className={styles.artworkGraph} viewBox="0 0 400 180" aria-hidden="true">
        <path d="M12 142 84 108 142 125 202 63 266 91 326 38 388 52" />
        <path d="M12 168 84 136 142 148 202 98 266 118 326 77 388 86" />
        <circle cx="84" cy="108" r="4" /><circle cx="202" cy="63" r="5" />
        <circle cx="266" cy="91" r="4" /><circle cx="326" cy="38" r="5" />
      </svg>
      <span className={styles.artworkCaption}>{article.category.toUpperCase()}</span>
    </div>
  );
}

function ArticleCard({ article }) {
  return (
    <article className={styles.articleCard}>
      <Link to={`/ourblog/${article.slug}`} className={styles.cardLink} aria-label={`Read article: ${article.title}`}>
        <ArticleArtwork article={article} />
        <div className={styles.cardContent}>
          <span className={styles.categoryLabel}>{article.category}</span>
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          <div className={styles.cardMeta}>
            <span>{article.readTime}</span>
            <span className={styles.readLink}>Read Article <FiArrowUpRight aria-hidden="true" /></span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ArticleComingSoon({ article }) {
  return (
    <>
      <main className={styles.articlePlaceholder}>
        <section className={styles.placeholderCard}>
          <span className={styles.eyebrow}>COGNIFACE JOURNAL</span>
          <span className={styles.placeholderMark}><FiLayers aria-hidden="true" /></span>
          <h1>{article?.title || "This article is not available yet."}</h1>
          <p>
            {article
              ? "The full reading experience is coming soon. This article is part of the CogniFace journal."
              : "We could not find an article at this address. Explore the journal to find another topic."}
          </p>
          <Link to="/ourblog" className={styles.primaryLink}>Back to the Blog <FiArrowRight aria-hidden="true" /></Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

function Blog() {
  const { slug } = useParams();
  const mainRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const article = slug ? articles.find(item => item.slug === slug) : null;

  useEffect(() => {
    if (slug) return undefined;
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
  }, [slug]);

  if (slug && !article) return <NotFound />;
  if (slug) return <ArticleComingSoon article={article} />;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredArticles = articles.filter(item => {
    const matchesCategory = activeCategory === "All Articles" || item.category === activeCategory;
    const searchableText = `${item.title} ${item.excerpt} ${item.category} ${item.keywords}`.toLowerCase();
    return matchesCategory && (!normalizedSearch || searchableText.includes(normalizedSearch));
  });
  const showFeatured = activeCategory === "All Articles" && !normalizedSearch;
  const featuredArticle = showFeatured ? articles[0] : null;
  const visibleArticles = showFeatured
    ? filteredArticles.filter(item => item.slug !== featuredArticle.slug)
    : filteredArticles;

  return (
    <>
      <main ref={mainRef} className={styles.blogPage}>
        <div className={styles.blogContent}>
          <section className={styles.blogHero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}><i /> THE KNOWLEDGE HUB</span>
              <h1>Explore the World of <span>Intelligent Identity.</span></h1>
              <p>
                Discover insights, ideas and practical knowledge about facial recognition,
                computer vision, artificial intelligence and the technologies shaping the
                future of identity verification.
              </p>
              <a href="#latest-insights" className={styles.heroLink}>Explore the journal <FiArrowRight aria-hidden="true" /></a>
            </div>
            <HeroVisual />
            <span className={styles.heroDecoration} aria-hidden="true" />
          </section>

          {featuredArticle && (
            <section className={styles.featuredSection} data-reveal>
              <div className={styles.sectionOverline}><i /> EDITORIAL SPOTLIGHT</div>
              <Link to={`/ourblog/${featuredArticle.slug}`} className={styles.featuredCard}>
                <ArticleArtwork article={featuredArticle} featured />
                <div className={styles.featuredContent}>
                  <span className={styles.categoryLabel}>{featuredArticle.category}</span>
                  <span className={styles.featuredPill}>FEATURED ARTICLE</span>
                  <h2>{featuredArticle.title}</h2>
                  <p>{featuredArticle.excerpt}</p>
                  <div className={styles.featuredMeta}>
                    <span>{featuredArticle.readTime}</span>
                    <span className={styles.readLink}>Read Article <FiArrowRight aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          <section id="latest-insights" className={styles.latestSection} data-reveal>
            <div className={styles.latestHeading}>
              <div>
                <span className={styles.sectionOverline}>THE JOURNAL</span>
                <h2>Latest Insights</h2>
                <p>Explore ideas, explanations and perspectives on the technology behind intelligent identity systems.</p>
              </div>
              <label className={styles.searchField}>
                <FiSearch aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search articles"
                  aria-label="Search articles by title or keyword"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search">Clear</button>
                )}
              </label>
            </div>

            <div className={styles.browseControls}>
              <div className={styles.categoryList} role="group" aria-label="Filter articles by category">
                {categories.map(category => (
                  <button
                    type="button"
                    key={category}
                    className={activeCategory === category ? styles.activeCategory : ""}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <span className={styles.resultCount} aria-live="polite">
                {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {visibleArticles.length ? (
              <div className={styles.articleGrid} aria-live="polite">
                {visibleArticles.map(item => <ArticleCard key={item.slug} article={item} />)}
              </div>
            ) : (
              <div className={styles.emptyState} role="status">
                <span><FiSearch aria-hidden="true" /></span>
                <h3>No articles found.</h3>
                <p>Try another keyword or explore a different category.</p>
                <button type="button" onClick={() => { setSearch(""); setActiveCategory("All Articles"); }}>
                  Clear filters
                </button>
              </div>
            )}
          </section>

          <section className={styles.newsletterSection} data-reveal>
            <div className={styles.newsletterMark}><FiMail aria-hidden="true" /></div>
            <div className={styles.newsletterCopy}>
              <span className={styles.sectionOverline}>THE COGNIFACE DISPATCH</span>
              <h2>Stay Ahead of the Technology.</h2>
              <p>Get useful insights, new articles and updates on facial recognition, artificial intelligence and intelligent identity systems.</p>
            </div>
            <div className={styles.newsletterForm}>
              <div className={styles.newsletterInputWrap}>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address for newsletter"
                  autoComplete="email"
                />
                <button type="button" onClick={() => setEmail("")}>
                  Subscribe <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          <section className={styles.finalCta} data-reveal>
            <div>
              <span className={styles.sectionOverline}>FROM IDEAS TO EXPERIENCE</span>
              <h2>Curious About Intelligent Identity?</h2>
              <p>Explore how facial recognition works and take the next step towards a smarter identity verification experience.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link to="/enrollment">Explore Enrollment <FiArrowRight aria-hidden="true" /></Link>
              <Link to="/verification">Explore Verification <FiArrowRight aria-hidden="true" /></Link>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

export default Blog;
