import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../lib/api';

export default function Articles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchArticles();
    }, [page, activeSearch]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 9,
                ...(activeSearch && { search: activeSearch }),
            });
            const { data } = await api.get(`/articles/published?${params}`);
            setArticles(data.articles);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setActiveSearch(search.trim());
    };

    const clearSearch = () => {
        setSearch('');
        setActiveSearch('');
        setPage(1);
    };

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
                    <Link href="/login" style={s.navLink}>Login</Link>
                    <Link href="/register" style={s.navBtn}>Submit Article</Link>
                </div>
            </nav>

            {/* Page Header */}
            <div style={s.pageHeader}>
                <div style={s.pageHeaderInner}>
                    <h1 style={s.pageTitle}>Browse Articles</h1>
                    <p style={s.pageSubtitle}>
                        {total > 0 ? `${total} published articles` : 'No articles published yet'}
                    </p>

                    {/* Search */}
                    <form onSubmit={handleSearch} style={s.searchForm}>
                        <div style={s.searchBox}>
                            <span style={s.searchIcon}>🔍</span>
                            <input
                                style={s.searchInput}
                                type="text"
                                placeholder="Search by title, keyword, or author..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" style={s.searchBtn}>Search</button>
                            {activeSearch && (
                                <button type="button" onClick={clearSearch} style={s.clearBtn}>
                                    ✕ Clear
                                </button>
                            )}
                        </div>
                    </form>

                    {activeSearch && (
                        <p style={s.searchResult}>
                            Showing results for <strong>"{activeSearch}"</strong> — {total} found
                        </p>
                    )}
                </div>
            </div>

            {/* Articles */}
            <div style={s.content}>
                {loading ? (
                    <div style={s.loading}>Loading articles...</div>
                ) : articles.length === 0 ? (
                    <div style={s.emptyState}>
                        <p style={{ fontSize: '48px', marginBottom: '16px' }}>📭</p>
                        <h3 style={s.emptyTitle}>No articles found</h3>
                        <p style={s.emptySubtitle}>
                            {activeSearch
                                ? `No results for "${activeSearch}". Try different keywords.`
                                : 'No articles have been published yet.'}
                        </p>
                        {activeSearch && (
                            <button onClick={clearSearch} style={s.emptyBtn}>
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={s.grid}>
                        {articles.map((article) => (
                            <Link href={`/articles/${article.id}`} key={article.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <span style={s.cardBadge}>Published</span>
                                    <span style={s.cardDate}>
                                        {new Date(article.published_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <h3 style={s.cardTitle}>{article.title}</h3>
                                <p style={s.cardAbstract}>
                                    {article.abstract?.slice(0, 150)}...
                                </p>
                                {article.keywords && (
                                    <div style={s.cardKeywords}>
                                        {article.keywords.split(',').slice(0, 3).map((kw) => (
                                            <span key={kw} style={s.keyword}>{kw.trim()}</span>
                                        ))}
                                    </div>
                                )}
                                <div style={s.cardFooter}>
                                    <span style={s.cardAuthor}>👤 {article.author_name}</span>
                                    <span style={s.cardReadMore}>Read more →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={s.pagination}>
                        <button
                            style={{ ...s.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                        >
                            ← Previous
                        </button>
                        <div style={s.pageNumbers}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    style={{
                                        ...s.pageNum,
                                        background: page === p ? '#1B3A6B' : 'white',
                                        color: page === p ? 'white' : '#475569',
                                    }}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            style={{ ...s.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={s.footer}>
                <p style={s.footerText}>© 2026 Analize Statistice Research Foundation. All rights reserved.</p>
            </footer>
        </div>
    );
}

const s = {
    navbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '70px', background: 'white',
        borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100,
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    navLogo: { width: '36px', height: '36px', objectFit: 'contain' },
    navBrand: { fontSize: '18px', fontWeight: '700', color: '#1B3A6B' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
    navLink: { color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: '500', padding: '8px 12px' },
    navBtn: {
        background: '#1B3A6B', color: 'white', textDecoration: 'none',
        fontSize: '14px', fontWeight: '600', padding: '9px 20px', borderRadius: '8px',
    },

    pageHeader: { background: '#1B3A6B', padding: '48px 48px 64px' },
    pageHeaderInner: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
    pageTitle: { color: 'white', fontSize: '36px', fontWeight: '700', marginBottom: '8px' },
    pageSubtitle: { color: '#93c5fd', fontSize: '16px', marginBottom: '32px' },

    searchForm: { marginBottom: '16px' },
    searchBox: {
        display: 'flex', alignItems: 'center', background: 'white',
        borderRadius: '12px', padding: '6px 6px 6px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    },
    searchIcon: { fontSize: '16px', marginRight: '8px' },
    searchInput: {
        flex: 1, border: 'none', outline: 'none',
        fontSize: '15px', color: '#1e293b', padding: '8px 0',
    },
    searchBtn: {
        background: '#1B3A6B', color: 'white', border: 'none',
        padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
        fontSize: '14px', cursor: 'pointer',
    },
    clearBtn: {
        background: '#f1f5f9', color: '#64748b', border: 'none',
        padding: '10px 16px', borderRadius: '8px', fontWeight: '500',
        fontSize: '14px', cursor: 'pointer', marginLeft: '6px',
    },
    searchResult: { color: '#bfdbfe', fontSize: '14px' },

    content: { maxWidth: '1100px', margin: '-24px auto 0', padding: '0 48px 60px' },
    loading: { textAlign: 'center', padding: '80px', color: '#94a3b8', fontSize: '16px' },

    emptyState: {
        textAlign: 'center', padding: '80px 20px',
        background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
    },
    emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
    emptySubtitle: { color: '#64748b', fontSize: '15px', marginBottom: '24px' },
    emptyBtn: {
        background: '#1B3A6B', color: 'white', border: 'none',
        padding: '10px 24px', borderRadius: '8px', fontWeight: '600',
        fontSize: '14px', cursor: 'pointer',
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
    },
    card: {
        background: 'white', borderRadius: '16px', padding: '24px',
        border: '1px solid #e2e8f0', textDecoration: 'none', display: 'block',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s',
    },
    cardTop: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '12px',
    },
    cardBadge: {
        background: '#dbeafe', color: '#1e40af',
        padding: '3px 10px', borderRadius: '999px',
        fontSize: '11px', fontWeight: '600',
    },
    cardDate: { color: '#94a3b8', fontSize: '12px' },
    cardTitle: {
        fontSize: '16px', fontWeight: '700', color: '#0f172a',
        marginBottom: '10px', lineHeight: '1.5',
    },
    cardAbstract: {
        fontSize: '13px', color: '#64748b',
        lineHeight: '1.7', marginBottom: '14px',
    },
    cardKeywords: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' },
    keyword: {
        background: '#f0f9ff', color: '#0369a1',
        padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
    },
    cardFooter: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', paddingTop: '14px',
        borderTop: '1px solid #f1f5f9',
    },
    cardAuthor: { color: '#94a3b8', fontSize: '13px' },
    cardReadMore: { color: '#1B3A6B', fontSize: '13px', fontWeight: '600' },

    pagination: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '12px',
        marginTop: '48px', flexWrap: 'wrap',
    },
    pageBtn: {
        background: 'white', border: '1px solid #e2e8f0',
        color: '#475569', padding: '10px 20px', borderRadius: '8px',
        fontWeight: '600', fontSize: '14px', cursor: 'pointer',
    },
    pageNumbers: { display: 'flex', gap: '6px' },
    pageNum: {
        width: '40px', height: '40px', borderRadius: '8px',
        border: '1px solid #e2e8f0', fontWeight: '600',
        fontSize: '14px', cursor: 'pointer',
    },

    footer: {
        background: '#0f172a', padding: '24px 48px', textAlign: 'center',
    },
    footerText: { color: '#475569', fontSize: '13px' },
};