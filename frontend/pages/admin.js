import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from './lib/api';

export default function Admin() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'ADMIN') { router.push('/dashboard'); return; }
        setUser(u);
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async (status = '') => {
        setLoading(true);
        try {
            const params = status ? `?status=${status}` : '';
            const { data } = await api.get(`/admin/submissions${params}`);
            setSubmissions(data.submissions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (status) => {
        setFilter(status);
        fetchSubmissions(status);
    };

    const handleApprove = async (id) => {
        setActionLoading(id + '_approve');
        try {
            await api.put(`/admin/submissions/${id}/approve`);
            fetchSubmissions(filter);
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        setActionLoading(rejectModal + '_reject');
        try {
            await api.put(`/admin/submissions/${rejectModal}/reject`, { reason: rejectReason });
            setRejectModal(null);
            setRejectReason('');
            fetchSubmissions(filter);
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed.');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublish = async (id) => {
        setActionLoading(id + '_publish');
        try {
            await api.put(`/admin/articles/${id}/publish`);
            fetchSubmissions(filter);
        } catch (err) {
            alert(err.response?.data?.error || 'Payment not completed yet.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleHide = async (id) => {
        setActionLoading(id + '_hide');
        try {
            await api.patch(`/admin/articles/${id}/hide`);
            fetchSubmissions(filter);
        } catch (err) {
            alert('Action failed.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this article? This cannot be undone.')) return;
        setActionLoading(id + '_delete');
        try {
            await api.delete(`/admin/articles/${id}`);
            fetchSubmissions(filter);
        } catch (err) {
            alert('Delete failed.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getStatusBadge = (status) => {
        const map = {
            PENDING: { label: 'Pending Review', cls: 'badge-pending' },
            APPROVED: { label: 'Approved', cls: 'badge-approved' },
            REJECTED: { label: 'Rejected', cls: 'badge-rejected' },
            PAYMENT_PENDING: { label: 'Payment Pending', cls: 'badge-payment' },
            PUBLISHED: { label: 'Published', cls: 'badge-published' },
            HIDDEN: { label: 'Hidden', cls: 'badge-hidden' },
        };
        const s = map[status] || { label: status, cls: 'badge-pending' };
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    // Stats
    const stats = [
        { label: 'Total', value: submissions.length, color: '#1B3A6B' },
        { label: 'Pending Review', value: submissions.filter(a => a.status === 'PENDING').length, color: '#d97706' },
        { label: 'Payment Pending', value: submissions.filter(a => a.status === 'PAYMENT_PENDING').length, color: '#7c3aed' },
        { label: 'Published', value: submissions.filter(a => a.status === 'PUBLISHED').length, color: '#16a34a' },
    ];

    const FILTERS = [
        { label: 'All', value: '' },
        { label: 'Pending Review', value: 'PENDING' },
        { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Hidden', value: 'HIDDEN' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

            {/* Navbar */}
            <nav className="navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="ASRF" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <div>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>ASRF Admin Panel</div>
                        <div style={{ color: '#93c5fd', fontSize: '11px' }}>Research Publication Platform</div>
                    </div>
                </div>
                <div className="navbar-links">
                    <Link href="/articles" className="navbar-link">View Site</Link>
                    <button className="navbar-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="page">

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>Admin Dashboard</h1>
                        <p style={s.pageSubtitle}>Manage all article submissions and publications</p>
                    </div>
                </div>

                {/* Stats */}
                <div style={s.statsGrid}>
                    {stats.map((st) => (
                        <div className="stat-card" key={st.label}>
                            <div className="stat-number" style={{ color: st.color }}>{st.value}</div>
                            <div className="stat-label">{st.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={s.filterRow}>
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => handleFilter(f.value)}
                            style={{
                                ...s.filterBtn,
                                background: filter === f.value ? '#1B3A6B' : 'white',
                                color: filter === f.value ? 'white' : '#475569',
                                borderColor: filter === f.value ? '#1B3A6B' : '#e2e8f0',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div style={s.tableSection}>
                    {loading ? (
                        <div style={s.loading}>Loading submissions...</div>
                    ) : submissions.length === 0 ? (
                        <div className="empty-state">
                            <p style={{ fontSize: '40px' }}>📭</p>
                            <p>No submissions found.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title & Author</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((article) => (
                                        <tr key={article.id}>
                                            <td>
                                                <p style={s.articleTitle}>{article.title}</p>
                                                <p style={s.articleAuthor}>{article.author_name} · {article.author_email}</p>
                                                {article.reject_note && (
                                                    <p style={s.rejectNote}>Reason: {article.reject_note}</p>
                                                )}
                                            </td>
                                            <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '13px' }}>
                                                {new Date(article.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td>{getStatusBadge(article.status)}</td>
                                            <td>
                                                {article.payment_status === 'SUCCESS' ? (
                                                    <span style={s.paySuccess}>✓ Paid</span>
                                                ) : article.status === 'PAYMENT_PENDING' ? (
                                                    <span style={s.payPending}>Awaiting</span>
                                                ) : (
                                                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={s.actions}>
                                                    {/* Approve — only for PENDING */}
                                                    {article.status === 'PENDING' && (
                                                        <button
                                                            style={{ ...s.actionBtn, ...s.btnApprove }}
                                                            onClick={() => handleApprove(article.id)}
                                                            disabled={actionLoading === article.id + '_approve'}
                                                        >
                                                            {actionLoading === article.id + '_approve' ? '...' : '✓ Approve'}
                                                        </button>
                                                    )}

                                                    {/* Reject — for PENDING or PAYMENT_PENDING */}
                                                    {['PENDING', 'PAYMENT_PENDING'].includes(article.status) && (
                                                        <button
                                                            style={{ ...s.actionBtn, ...s.btnReject }}
                                                            onClick={() => { setRejectModal(article.id); setRejectReason(''); }}
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    )}

                                                    {/* Publish — for APPROVED with successful payment */}
                                                    {article.status === 'APPROVED' && article.payment_status === 'SUCCESS' && (
                                                        <button
                                                            style={{ ...s.actionBtn, ...s.btnPublish }}
                                                            onClick={() => handlePublish(article.id)}
                                                            disabled={actionLoading === article.id + '_publish'}
                                                        >
                                                            {actionLoading === article.id + '_publish' ? '...' : '🚀 Publish'}
                                                        </button>
                                                    )}

                                                    {/* Hide — for PUBLISHED */}
                                                    {article.status === 'PUBLISHED' && (
                                                        <button
                                                            style={{ ...s.actionBtn, ...s.btnHide }}
                                                            onClick={() => handleHide(article.id)}
                                                            disabled={actionLoading === article.id + '_hide'}
                                                        >
                                                            Hide
                                                        </button>
                                                    )}

                                                    {/* Download file */}

                                                    <a href={`http://localhost:5000${article.file_url}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ ...s.actionBtn, ...s.btnDownload, textDecoration: 'none' }}
>
                                                    ↓ File
                                                    </a>

                                                    {/* Delete — always available */}
                                                    <button
                                                        style={{ ...s.actionBtn, ...s.btnDelete }}
                                                        onClick={() => handleDelete(article.id)}
                                                        disabled={actionLoading === article.id + '_delete'}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <h3 style={s.modalTitle}>Reject Article</h3>
                        <p style={s.modalSubtitle}>
                            Provide a reason for rejection. This will be sent to the author via email.
                        </p>
                        <textarea
                            className="input"
                            placeholder="e.g. The methodology section lacks sufficient detail..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{ minHeight: '100px', marginBottom: '16px' }}
                        />
                        <div style={s.modalActions}>
                            <button
                                style={{ ...s.actionBtn, ...s.btnReject, padding: '10px 24px' }}
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                            <button
                                style={{ ...s.actionBtn, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 24px' }}
                                onClick={() => setRejectModal(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {

    btnDownload: { background: '#f0f9ff', color: '#0369a1' },

    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '32px',
    },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
    pageSubtitle: { color: '#64748b', fontSize: '15px' },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '24px',
    },
    filterRow: {
        display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px',
    },
    filterBtn: {
        padding: '8px 16px', borderRadius: '8px', border: '1px solid',
        fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
    },
    tableSection: {
        background: 'white', borderRadius: '16px',
        border: '1px solid #e2e8f0', overflow: 'hidden',
    },
    loading: { padding: '60px', textAlign: 'center', color: '#94a3b8' },
    articleTitle: { fontWeight: '600', color: '#1e293b', fontSize: '14px', maxWidth: '280px' },
    articleAuthor: { color: '#94a3b8', fontSize: '12px', marginTop: '4px' },
    rejectNote: { color: '#dc2626', fontSize: '12px', marginTop: '4px' },
    paySuccess: { color: '#16a34a', fontSize: '13px', fontWeight: '600' },
    payPending: { color: '#d97706', fontSize: '13px', fontWeight: '500' },
    actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    actionBtn: {
        padding: '6px 12px', borderRadius: '7px', border: 'none',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
    },
    btnApprove: { background: '#dcfce7', color: '#166534' },
    btnReject: { background: '#fee2e2', color: '#991b1b' },
    btnPublish: { background: '#dbeafe', color: '#1e40af' },
    btnHide: { background: '#fef9c3', color: '#854d0e' },
    btnDelete: { background: '#f1f5f9', color: '#64748b' },

    // Modal
    modalOverlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
    },
    modal: {
        background: 'white', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
    modalSubtitle: { color: '#64748b', fontSize: '14px', marginBottom: '20px' },
    modalActions: { display: 'flex', gap: '12px' },
};