import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from './lib/api';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user from localStorage
        const stored = localStorage.getItem('user');
        if (!stored) {
            router.push('/login');
            return;
        }
        const u = JSON.parse(stored);
        if (u.role === 'ADMIN') {
            router.push('/admin');
            return;
        }
        setUser(u);
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data } = await api.get('/articles/my-submissions');
            setArticles(data.articles);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getStatusBadge = (status) => {
        const map = {
            PENDING: { label: 'Under Review', cls: 'badge-pending' },
            APPROVED: { label: 'Approved', cls: 'badge-approved' },
            REJECTED: { label: 'Rejected', cls: 'badge-rejected' },
            PAYMENT_PENDING: { label: 'Payment Required', cls: 'badge-payment' },
            PUBLISHED: { label: 'Published', cls: 'badge-published' },
            HIDDEN: { label: 'Hidden', cls: 'badge-hidden' },
        };
        const s = map[status] || { label: status, cls: 'badge-pending' };
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    // Stats
    const stats = [
        { label: 'Total Submitted', value: articles.length, color: '#1B3A6B' },
        { label: 'Under Review', value: articles.filter(a => a.status === 'PENDING').length, color: '#d97706' },
        { label: 'Payment Required', value: articles.filter(a => a.status === 'PAYMENT_PENDING').length, color: '#7c3aed' },
        { label: 'Published', value: articles.filter(a => a.status === 'PUBLISHED').length, color: '#16a34a' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Loading...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

            {/* Navbar */}
            <nav className="navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="ASRF" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <span className="navbar-brand">Analize Statistice Research Foundation</span>
                </div>
                <div className="navbar-links">
                    <Link href="/articles" className="navbar-link">Browse Articles</Link>
                    <button className="navbar-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="page">

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>My Dashboard</h1>
                        <p style={styles.pageSubtitle}>Welcome back, {user?.name}</p>
                    </div>
                    <Link href="/submit" style={styles.submitBtn}>
                        + Submit New Article
                    </Link>
                </div>

                {/* Stats */}
                <div style={styles.statsGrid}>
                    {stats.map((s) => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Articles Table */}
                <div style={styles.tableSection}>
                    <div style={styles.tableHeader}>
                        <h2 style={styles.tableTitle}>My Submissions</h2>
                    </div>

                    {articles.length === 0 ? (
                        <div className="empty-state">
                            <p style={{ fontSize: '40px' }}>📄</p>
                            <p>No submissions yet.</p>
                            <Link href="/submit" style={{ color: '#1B3A6B', fontWeight: '600' }}>
                                Submit your first article →
                            </Link>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articles.map((article) => (
                                        <tr key={article.id}>
                                            <td>
                                                <p style={styles.articleTitle}>{article.title}</p>
                                                {article.reject_note && (
                                                    <p style={styles.rejectNote}>Note: {article.reject_note}</p>
                                                )}
                                            </td>
                                            <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(article.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td>{getStatusBadge(article.status)}</td>
                                            <td>
                                                {article.status === 'PAYMENT_PENDING' && (
                                                    <Link href={`/pay/${article.id}`} style={styles.payBtn}>
                                                        Pay Now
                                                    </Link>
                                                )}
                                                {article.status === 'PUBLISHED' && (
                                                    <Link href={`/articles/${article.id}`} style={styles.viewBtn}>
                                                        View →
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '4px',
    },
    pageSubtitle: {
        color: '#64748b',
        fontSize: '15px',
    },
    submitBtn: {
        background: '#1B3A6B',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '15px',
        whiteSpace: 'nowrap',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    tableSection: {
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
    },
    tableHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
    },
    tableTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#0f172a',
    },
    articleTitle: {
        fontWeight: '500',
        color: '#1e293b',
        maxWidth: '300px',
    },
    rejectNote: {
        fontSize: '12px',
        color: '#dc2626',
        marginTop: '4px',
    },
    payBtn: {
        background: '#7c3aed',
        color: 'white',
        padding: '6px 14px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: '600',
    },
    viewBtn: {
        color: '#1B3A6B',
        fontWeight: '600',
        textDecoration: 'none',
        fontSize: '14px',
    },
};