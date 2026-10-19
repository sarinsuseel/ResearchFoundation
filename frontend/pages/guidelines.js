import Link from 'next/link';

export default function Guidelines() {
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

            {/* Navbar */}
            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <img src="/logo.png" alt="ASRF" style={s.navLogo} />
                    <div>
                        <div style={s.navBrand}>Analize Statistice Research Foundation</div>
                    </div>
                </div>
                <div style={s.navLinks}>
                    <Link href="/" style={s.navLink}>Home</Link>
                    <Link href="/articles" style={s.navLink}>Browse Articles</Link>
                    <Link href="/guidelines" style={{ ...s.navLink, color: '#1B3A6B', fontWeight: '700' }}>Guidelines</Link>
                    <Link href="/login" style={s.navLink}>Login</Link>
                    <Link href="/register" style={s.navBtn}>Submit Article</Link>
                </div>
            </nav>

            {/* Header */}
            <div style={s.pageHeader}>
                <h1 style={s.pageTitle}>Author Guidelines</h1>
                <p style={s.pageSubtitle}>
                    Please read these guidelines carefully before submitting your manuscript
                </p>
            </div>

            {/* Content */}
            <div style={s.content}>

                {/* Quick overview */}
                <div style={s.overviewGrid}>
                    {[
                        { icon: '📄', title: 'Accepted Formats', desc: 'PDF, DOC, DOCX' },
                        { icon: '📏', title: 'File Size Limit', desc: 'Maximum 10 MB' },
                        { icon: '🌐', title: 'Language', desc: 'English only' },
                        { icon: '⏱️', title: 'Review Time', desc: '2–5 business days' },
                    ].map((item) => (
                        <div key={item.title} style={s.overviewCard}>
                            <div style={s.overviewIcon}>{item.icon}</div>
                            <div style={s.overviewTitle}>{item.title}</div>
                            <div style={s.overviewDesc}>{item.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Guidelines sections */}
                {GUIDELINES.map((section, i) => (
                    <div key={i} style={s.section}>
                        <div style={s.sectionNum}>{String(i + 1).padStart(2, '0')}</div>
                        <div style={s.sectionContent}>
                            <h2 style={s.sectionTitle}>{section.title}</h2>
                            <p style={s.sectionText}>{section.text}</p>
                            {section.points && (
                                <ul style={s.pointsList}>
                                    {section.points.map((point, j) => (
                                        <li key={j} style={s.point}>
                                            <span style={s.pointDot}>→</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}

                {/* CTA */}
                <div style={s.cta}>
                    <h2 style={s.ctaTitle}>Ready to Submit?</h2>
                    <p style={s.ctaSubtitle}>
                        Create your free account and submit your manuscript today.
                    </p>
                    <div style={s.ctaButtons}>
                        <Link href="/register" style={s.ctaBtnPrimary}>Create Account & Submit</Link>
                        <Link href="/login" style={s.ctaBtnSecondary}>Already have an account? Login</Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={s.footer}>
                <p style={s.footerText}>
                    © 2025 Analize Statistice Research Foundation. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

const GUIDELINES = [
    {
        title: 'Manuscript Preparation',
        text: 'Your manuscript should be well-structured and clearly written in English. Ensure all sections are complete before submission.',
        points: [
            'Include a clear and concise title (max 200 characters)',
            'Provide an abstract of 150–300 words summarising your research',
            'Add 3–8 relevant keywords separated by commas',
            'Ensure your manuscript is free of grammatical errors',
            'All figures and tables must be clearly labelled',
        ],
    },
    {
        title: 'File Format & Size',
        text: 'We accept manuscripts in the following formats. Ensure your file meets the requirements before uploading.',
        points: [
            'Accepted formats: PDF, Microsoft Word (.doc, .docx)',
            'Maximum file size: 10 MB',
            'File name should not contain special characters or spaces',
            'Ensure the file is not password protected',
        ],
    },
    {
        title: 'Originality & Plagiarism',
        text: 'All submitted work must be original and must not have been published elsewhere. We take academic integrity very seriously.',
        points: [
            'Submitted articles must be original and unpublished',
            'Plagiarism in any form will result in immediate rejection',
            'Proper citations must be provided for all referenced works',
            'AI-generated content must be clearly disclosed',
        ],
    },
    {
        title: 'Review Process',
        text: 'All submissions go through our editorial review process. You will be notified at every stage via email.',
        points: [
            'Initial screening: 1–2 business days',
            'Editorial review: 2–5 business days',
            'You will receive an email on approval or rejection',
            'Rejected articles may be revised and resubmitted',
        ],
    },
    {
        title: 'Publication Fee',
        text: 'A one-time publication fee is charged after your article is approved. Payment must be completed before the article is published.',
        points: [
            'Publication fee is charged only after editorial approval',
            'Payment is processed securely via Razorpay',
            'UPI, credit/debit cards, and net banking are accepted',
            'Fee is non-refundable once the article is published',
        ],
    },
    {
        title: 'Copyright & Licensing',
        text: 'By submitting your article, you agree to our publishing terms and grant us the right to publish your work.',
        points: [
            'Authors retain copyright of their work',
            'Articles are published under open access license',
            'Full credit is given to the authors on the published article',
            'Articles can be freely shared with proper attribution',
        ],
    },
];

const s = {
    navbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '70px', background: 'white',
        borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100,
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    navLogo: { width: '36px', height: '36px', objectFit: 'contain' },
    navBrand: { fontSize: '15px', fontWeight: '700', color: '#1B3A6B' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '4px' },
    navLink: { color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: '500', padding: '8px 12px' },
    navBtn: {
        background: '#1B3A6B', color: 'white', textDecoration: 'none',
        fontSize: '14px', fontWeight: '600', padding: '9px 20px', borderRadius: '8px',
    },

    pageHeader: {
        background: 'linear-gradient(160deg, #0f2547 0%, #1B3A6B 100%)',
        padding: '56px 48px', textAlign: 'center',
    },
    pageTitle: { color: 'white', fontSize: '36px', fontWeight: '700', marginBottom: '12px' },
    pageSubtitle: { color: '#93c5fd', fontSize: '16px' },

    content: { maxWidth: '900px', margin: '0 auto', padding: '48px 24px' },

    overviewGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '48px',
    },
    overviewCard: {
        background: 'white', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '20px', textAlign: 'center',
    },
    overviewIcon: { fontSize: '28px', marginBottom: '8px' },
    overviewTitle: { fontWeight: '600', color: '#1e293b', fontSize: '14px', marginBottom: '4px' },
    overviewDesc: { color: '#64748b', fontSize: '13px' },

    section: {
        display: 'flex', gap: '24px', marginBottom: '40px',
        background: 'white', borderRadius: '16px',
        border: '1px solid #e2e8f0', padding: '28px',
    },
    sectionNum: {
        fontSize: '28px', fontWeight: '800', color: '#e2e8f0',
        minWidth: '48px', lineHeight: '1',
    },
    sectionContent: { flex: 1 },
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' },
    sectionText: { color: '#64748b', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' },
    pointsList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' },
    point: { display: 'flex', gap: '10px', fontSize: '14px', color: '#374151', lineHeight: '1.6' },
    pointDot: { color: '#1B3A6B', fontWeight: '700', flexShrink: 0 },

    cta: {
        background: 'linear-gradient(160deg, #0f2547 0%, #1B3A6B 100%)',
        borderRadius: '16px', padding: '48px', textAlign: 'center', marginTop: '48px',
    },
    ctaTitle: { color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '12px' },
    ctaSubtitle: { color: '#93c5fd', fontSize: '16px', marginBottom: '32px' },
    ctaButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    ctaBtnPrimary: {
        background: 'white', color: '#1B3A6B', padding: '13px 28px',
        borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '15px',
    },
    ctaBtnSecondary: {
        background: 'rgba(255,255,255,0.1)', color: 'white', padding: '13px 28px',
        borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '15px',
        border: '1px solid rgba(255,255,255,0.3)',
    },

    footer: { background: '#0f172a', padding: '24px 48px', textAlign: 'center' },
    footerText: { color: '#475569', fontSize: '13px' },
};