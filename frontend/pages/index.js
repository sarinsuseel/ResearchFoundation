import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from './lib/api';

export default function Home() {
    const [search, setSearch] = useState('');
    const [recentArticles, setRecentArticles] = useState([]);
    const router_push = (path) => window.location.href = path;

    useEffect(() => {
        // Load recent published articles
        api.get('/articles/published?limit=3')
            .then(({ data }) => setRecentArticles(data.articles || []))
            .catch(() => { });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) window.location.href = `/articles?search=${encodeURIComponent(search)}`;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'Inter, -apple-system, sans-serif' }}>

            {/* ── Navbar ── */}
            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <img src="/logo.png" alt="ASRF" style={s.navLogo} />
                    <div>
                        <div style={s.navBrand}>Analize Statistice Research Foundation</div>
                        <div style={s.navTagline}>Research Publication Platform</div>
                    </div>
                </div>
                <div style={s.navLinks}>
                    <Link href="/articles" style={s.navLink}>Browse Articles</Link>
                    <Link href="/#about" style={s.navLink}>About</Link>
                    <Link href="/#scope" style={s.navLink}>Scope</Link>
                    <Link href="/login" style={s.navLink}>Login</Link>
                    <Link href="/register" style={s.navBtn}>Submit Article</Link>
                </div>
                {/* Mobile menu button */}
                <button style={s.mobileMenuBtn} onClick={() => {
                    const m = document.getElementById('mobileMenu');
                    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
                }}>☰</button>
            </nav>

            {/* Mobile menu */}
            <div id="mobileMenu" style={s.mobileMenu}>
                <Link href="/articles" style={s.mobileLink}>Browse Articles</Link>
                <Link href="/login" style={s.mobileLink}>Login</Link>
                <Link href="/register" style={{ ...s.mobileLink, color: '#1B3A6B', fontWeight: '700' }}>Submit Article</Link>
            </div>

            {/* ── Hero ── */}
            <section style={s.hero}>
                <div style={s.heroInner}>
                    <div style={s.heroBadge}>🎓 Peer-Reviewed Open Access Journal</div>
                    <h1 style={s.heroTitle}>
                        Publish Your Research<br />
                        <span style={s.heroAccent}>With Global Impact</span>
                    </h1>
                    <p style={s.heroSubtitle}>
                        ASRF Research Platform provides a rigorous peer-review process and
                        open-access publishing for researchers worldwide across all disciplines.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={s.searchForm}>
                        <div style={s.searchBox}>
                            <span style={s.searchIcon}>🔍</span>
                            <input
                                style={s.searchInput}
                                type="text"
                                placeholder="Search articles by title, keyword, or author..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" style={s.searchBtn}>Search</button>
                        </div>
                    </form>

                    <div style={s.heroActions}>
                        <Link href="/register" style={s.heroBtnPrimary}>Submit Your Article →</Link>
                        <Link href="/articles" style={s.heroBtnSecondary}>Browse Articles</Link>
                    </div>

                    {/* Stats */}
                    <div style={s.statsRow}>
                        {[
                            { val: '500+', label: 'Articles Published' },
                            { val: '1,200+', label: 'Registered Authors' },
                            { val: '48hrs', label: 'Avg. Review Time' },
                            { val: '100%', label: 'Open Access' },
                        ].map((st) => (
                            <div key={st.label} style={s.stat}>
                                <div style={s.statVal}>{st.val}</div>
                                <div style={s.statLabel}>{st.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trust Bar ── */}
            <section style={s.trustBar}>
                <div style={s.trustInner}>
                    {[
                        '✓ Peer Reviewed',
                        '✓ Open Access',
                        '✓ Fast Publication',
                        '✓ Digital Object Identifier (DOI)',
                        '✓ Plagiarism Checked',
                        '✓ Secure Payments',
                    ].map((t) => (
                        <span key={t} style={s.trustItem}>{t}</span>
                    ))}
                </div>
            </section>

            {/* ── Recent Articles ── */}
            {recentArticles.length > 0 && (
                <section style={s.section}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionHeader}>
                            <h2 style={s.sectionTitle}>Recently Published</h2>
                            <Link href="/articles" style={s.seeAll}>View all articles →</Link>
                        </div>
                        <div style={s.articlesGrid}>
                            {recentArticles.map((a) => (
                                <Link href={`/articles/${a.id}`} key={a.id} style={s.articleCard}>
                                    <div style={s.articleMeta}>
                                        <span style={s.articleBadge}>Published</span>
                                        <span style={s.articleDate}>
                                            {new Date(a.published_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <h3 style={s.articleTitle}>{a.title}</h3>
                                    <p style={s.articleAbstract}>
                                        {a.abstract?.slice(0, 120)}...
                                    </p>
                                    <p style={s.articleAuthor}>By {a.author_name}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── How It Works ── */}
            <section style={{ ...s.section, background: '#f8fafc' }}>
                <div style={s.sectionInner}>
                    <div style={{ ...s.sectionHeader, flexDirection: 'column', alignItems: 'center' }}>
                        <h2 style={s.sectionTitle}>How It Works</h2>
                        <p style={s.sectionSubtitle}>From submission to publication in four simple steps</p>
                    </div>
                    <div style={s.stepsGrid}>
                        {STEPS.map((step) => (
                            <div key={step.num} style={s.stepCard}>
                                <div style={s.stepIconBox}>{step.icon}</div>
                                <div style={s.stepNum}>Step {step.num}</div>
                                <h3 style={s.stepTitle}>{step.title}</h3>
                                <p style={s.stepDesc}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Scope ── */}
            <section style={s.section} id="scope">
                <div style={s.sectionInner}>
                    <div style={{ ...s.sectionHeader, flexDirection: 'column', alignItems: 'center' }}>
                        <h2 style={s.sectionTitle}>Scope & Subject Areas</h2>
                        <p style={s.sectionSubtitle}>We publish research across a wide range of disciplines</p>
                    </div>
                    <div style={s.scopeGrid}>
                        {SUBJECTS.map((sub) => (
                            <div key={sub.title} style={s.scopeCard}>
                                <span style={s.scopeIcon}>{sub.icon}</span>
                                <span style={s.scopeTitle}>{sub.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why ASRF ── */}
            <section style={{ ...s.section, background: '#f8fafc' }} id="about">
                <div style={s.sectionInner}>
                    <div style={{ ...s.sectionHeader, flexDirection: 'column', alignItems: 'center' }}>
                        <h2 style={s.sectionTitle}>Why Choose ASRF?</h2>
                        <p style={s.sectionSubtitle}>Built for researchers who want impact</p>
                    </div>
                    <div style={s.featuresGrid}>
                        {FEATURES.map((f) => (
                            <div key={f.title} style={s.featureCard}>
                                <div style={s.featureIcon}>{f.icon}</div>
                                <h3 style={s.featureTitle}>{f.title}</h3>
                                <p style={s.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Author Guidelines CTA ── */}
            <section style={s.guidelines}>
                <div style={s.guidelinesInner}>
                    <div style={s.guidelinesLeft}>
                        <h2 style={s.guidelinesTitle}>Ready to Submit Your Research?</h2>
                        <p style={s.guidelinesSubtitle}>
                            Read our author guidelines before submitting to ensure your manuscript meets our requirements.
                        </p>
                    </div>
                    <div style={s.guidelinesRight}>
                        <Link href="/guidelines" style={s.guidelinesBtn}>Read Author Guidelines</Link>
                        <Link href="/register" style={s.guidelinesBtnPrimary}>Start Submission</Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={s.footer}>
                <div style={s.footerInner}>
                    <div style={s.footerTop}>
                        <div style={s.footerBrand}>
                            <img src="/logo.png" alt="ASRF" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                            <div>
                                <div style={s.footerBrandName}>Analize Statistice Research Foundation</div>
                                <div style={s.footerBrandTagline}>Advancing Science Through Open Access</div>
                            </div>
                        </div>
                        <div style={s.footerLinks}>
                            <div style={s.footerCol}>
                                <div style={s.footerColTitle}>Platform</div>
                                <Link href="/articles" style={s.footerLink}>Browse Articles</Link>
                                <Link href="/register" style={s.footerLink}>Submit Article</Link>
                                <Link href="/login" style={s.footerLink}>Login</Link>
                            </div>
                            <div style={s.footerCol}>
                                <div style={s.footerColTitle}>Information</div>
                                <Link href="/guidelines" style={s.footerLink}>Author Guidelines</Link>
                                <Link href="/#scope" style={s.footerLink}>Scope</Link>
                                <Link href="/#about" style={s.footerLink}>About Us</Link>
                            </div>
                        </div>
                    </div>
                    <div style={s.footerBottom}>
                        <p style={s.footerCopy}>© 2026 Analize Statistice Research Foundation. All rights reserved.</p>
                        <p style={s.footerCopy}>Open Access | Peer Reviewed | Plagiarism Free</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const STEPS = [
    { num: '01', icon: '📝', title: 'Register', desc: 'Create your free account with email verification in under 2 minutes.' },
    { num: '02', icon: '📤', title: 'Submit', desc: 'Upload your manuscript with title, abstract, and keywords.' },
    { num: '03', icon: '🔍', title: 'Peer Review', desc: 'Editorial team reviews and provides feedback within 2–5 business days.' },
    { num: '04', icon: '🌍', title: 'Publish', desc: 'After approval and payment, your article goes live for the world to read.' },
];

const SUBJECTS = [
    { icon: '💻', title: 'Computer Science' },
    { icon: '⚗️', title: 'Chemistry' },
    { icon: '🧬', title: 'Biology & Life Sciences' },
    { icon: '⚡', title: 'Electrical Engineering' },
    { icon: '🏗️', title: 'Civil Engineering' },
    { icon: '🧠', title: 'Artificial Intelligence' },
    { icon: '🏥', title: 'Medical Sciences' },
    { icon: '📐', title: 'Mathematics' },
    { icon: '🌿', title: 'Environmental Science' },
    { icon: '💰', title: 'Economics & Finance' },
    { icon: '🔭', title: 'Physics & Astronomy' },
    { icon: '📚', title: 'Social Sciences' },
];

const FEATURES = [
    { icon: '⚡', title: 'Fast Peer Review', desc: 'Get your manuscript reviewed within 48–72 hours by domain experts.' },
    { icon: '🌍', title: '100% Open Access', desc: 'Your research is freely accessible to readers worldwide, maximising impact.' },
    { icon: '🔒', title: 'Secure & Trusted', desc: 'OTP verification, encrypted payments, and data privacy guaranteed.' },
    { icon: '📊', title: 'Real-time Tracking', desc: 'Track your submission status live from your personal dashboard.' },
    { icon: '💳', title: 'Easy Payment', desc: 'Pay securely via Razorpay after approval. UPI, cards, and net banking accepted.' },
    { icon: '📧', title: 'Instant Notifications', desc: 'Email alerts at every stage — submission, review, approval, and publication.' },
];

const s = {
    // Navbar
    navbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '70px', background: 'white',
        borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    navLogo: { width: '40px', height: '40px', objectFit: 'contain' },
    navBrand: { fontSize: '18px', fontWeight: '800', color: '#1B3A6B', lineHeight: '1.2' },
    navTagline: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '4px' },
    navLink: {
        color: '#475569', textDecoration: 'none', fontSize: '14px',
        fontWeight: '500', padding: '8px 12px', borderRadius: '8px',
    },
    navBtn: {
        background: '#1B3A6B', color: 'white', textDecoration: 'none',
        fontSize: '14px', fontWeight: '600', padding: '9px 20px',
        borderRadius: '8px', marginLeft: '8px',
    },
    mobileMenuBtn: {
        display: 'none', background: 'none', border: 'none',
        fontSize: '24px', cursor: 'pointer', color: '#1B3A6B',
        '@media(max-width:768px)': { display: 'block' },
    },
    mobileMenu: {
        display: 'none', flexDirection: 'column', background: 'white',
        padding: '16px 24px', borderBottom: '1px solid #e2e8f0', gap: '12px',
    },
    mobileLink: {
        color: '#475569', textDecoration: 'none', fontSize: '15px',
        fontWeight: '500', padding: '8px 0',
    },

    // Hero
    hero: {
        background: 'linear-gradient(160deg, #0f2547 0%, #1B3A6B 55%, #2563eb 100%)',
        padding: '80px 48px',
    },
    heroInner: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
    heroBadge: {
        display: 'inline-block', background: 'rgba(255,255,255,0.15)',
        color: '#bfdbfe', padding: '6px 18px', borderRadius: '999px',
        fontSize: '13px', fontWeight: '500', marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    heroTitle: {
        fontSize: '52px', fontWeight: '800', color: 'white',
        lineHeight: '1.15', marginBottom: '20px',
    },
    heroAccent: { color: '#60a5fa' },
    heroSubtitle: {
        color: '#93c5fd', fontSize: '18px', lineHeight: '1.7',
        marginBottom: '36px', maxWidth: '600px', margin: '0 auto 36px',
    },

    // Search
    searchForm: { marginBottom: '32px' },
    searchBox: {
        display: 'flex', alignItems: 'center',
        background: 'white', borderRadius: '12px',
        padding: '6px 6px 6px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        maxWidth: '620px', margin: '0 auto',
    },
    searchIcon: { fontSize: '18px', marginRight: '8px' },
    searchInput: {
        flex: 1, border: 'none', outline: 'none',
        fontSize: '15px', color: '#1e293b', background: 'transparent',
        padding: '8px 0',
    },
    searchBtn: {
        background: '#1B3A6B', color: 'white', border: 'none',
        padding: '10px 24px', borderRadius: '8px', fontWeight: '600',
        fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap',
    },

    heroActions: {
        display: 'flex', gap: '16px', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '48px',
    },
    heroBtnPrimary: {
        background: 'white', color: '#1B3A6B', padding: '14px 32px',
        borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '15px',
    },
    heroBtnSecondary: {
        background: 'rgba(255,255,255,0.12)', color: 'white',
        padding: '14px 32px', borderRadius: '10px', textDecoration: 'none',
        fontWeight: '600', fontSize: '15px', border: '1px solid rgba(255,255,255,0.3)',
    },

    statsRow: {
        display: 'flex', gap: '40px', justifyContent: 'center',
        flexWrap: 'wrap', paddingTop: '32px',
        borderTop: '1px solid rgba(255,255,255,0.15)',
    },
    stat: { textAlign: 'center' },
    statVal: { color: 'white', fontSize: '30px', fontWeight: '800' },
    statLabel: { color: '#93c5fd', fontSize: '13px', marginTop: '4px' },

    // Trust bar
    trustBar: { background: '#1B3A6B', padding: '14px 48px' },
    trustInner: {
        display: 'flex', gap: '32px', flexWrap: 'wrap',
        justifyContent: 'center', maxWidth: '1100px', margin: '0 auto',
    },
    trustItem: { color: '#bfdbfe', fontSize: '13px', fontWeight: '500' },

    // Sections
    section: { padding: '72px 48px', background: 'white' },
    sectionInner: { maxWidth: '1100px', margin: '0 auto' },
    sectionHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '40px',
    },
    sectionTitle: { fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' },
    sectionSubtitle: { color: '#64748b', fontSize: '16px' },
    seeAll: { color: '#1B3A6B', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },

    // Articles grid
    articlesGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
    },
    articleCard: {
        background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px',
        padding: '24px', textDecoration: 'none', display: 'block',
        transition: 'all 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    },
    articleMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    articleBadge: {
        background: '#dbeafe', color: '#1e40af', padding: '3px 10px',
        borderRadius: '999px', fontSize: '11px', fontWeight: '600',
    },
    articleDate: { color: '#94a3b8', fontSize: '12px' },
    articleTitle: { fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '8px', lineHeight: '1.5' },
    articleAbstract: { fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px' },
    articleAuthor: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },

    // Steps
    stepsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
    },
    stepCard: {
        background: 'white', border: '1px solid #e2e8f0',
        borderRadius: '16px', padding: '28px',
    },
    stepIconBox: { fontSize: '36px', marginBottom: '16px' },
    stepNum: { fontSize: '11px', fontWeight: '700', color: '#1B3A6B', letterSpacing: '0.1em', marginBottom: '8px' },
    stepTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
    stepDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' },

    // Scope
    scopeGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
    },
    scopeCard: {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '10px', padding: '14px 16px',
    },
    scopeIcon: { fontSize: '20px' },
    scopeTitle: { fontSize: '13px', fontWeight: '600', color: '#334155' },

    // Features
    featuresGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
    },
    featureCard: {
        background: 'white', border: '1px solid #e2e8f0',
        borderRadius: '16px', padding: '28px',
    },
    featureIcon: { fontSize: '32px', marginBottom: '16px' },
    featureTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
    featureDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' },

    // Guidelines CTA
    guidelines: { background: '#1B3A6B', padding: '56px 48px' },
    guidelinesInner: {
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap',
    },
    guidelinesLeft: { flex: 1 },
    guidelinesTitle: { color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '10px' },
    guidelinesSubtitle: { color: '#93c5fd', fontSize: '15px', lineHeight: '1.6' },
    guidelinesRight: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    guidelinesBtn: {
        background: 'rgba(255,255,255,0.15)', color: 'white',
        padding: '13px 24px', borderRadius: '10px', textDecoration: 'none',
        fontWeight: '600', fontSize: '15px', border: '1px solid rgba(255,255,255,0.3)',
        whiteSpace: 'nowrap',
    },
    guidelinesBtnPrimary: {
        background: 'white', color: '#1B3A6B',
        padding: '13px 24px', borderRadius: '10px', textDecoration: 'none',
        fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap',
    },

    // Footer
    footer: { background: '#0f172a', padding: '56px 48px 32px' },
    footerInner: { maxWidth: '1100px', margin: '0 auto' },
    footerTop: {
        display: 'flex', justifyContent: 'space-between',
        gap: '48px', flexWrap: 'wrap', marginBottom: '48px',
        paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    footerBrand: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
    footerBrandName: { color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '4px' },
    footerBrandTagline: { color: '#64748b', fontSize: '13px' },
    footerLinks: { display: 'flex', gap: '64px', flexWrap: 'wrap' },
    footerCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
    footerColTitle: { color: 'white', fontWeight: '600', fontSize: '13px', marginBottom: '4px' },
    footerLink: { color: '#64748b', textDecoration: 'none', fontSize: '14px' },
    footerBottom: {
        display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px',
    },
    footerCopy: { color: '#475569', fontSize: '13px' },
};