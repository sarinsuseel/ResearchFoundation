import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from './lib/api';

export default function Submit() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [keywords, setKeywords] = useState('');
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(stored));
    }, []);

    const handleFileChange = (selectedFile) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) {
            setError('Only PDF, DOC, DOCX files are allowed.');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be under 10MB.');
            return;
        }
        setError('');
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please upload your manuscript file.');

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('abstract', abstract);
            formData.append('keywords', keywords);
            formData.append('file', file);

            await api.post('/articles/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

            {/* Navbar */}
            <nav className="navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="ASRF" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <span className="navbar-brand">Analize Statistice Research Foundation</span>
                </div>
                <div className="navbar-links">
                    <Link href="/dashboard" className="navbar-link">Dashboard</Link>
                    <Link href="/articles" className="navbar-link">Browse Articles</Link>
                </div>
            </nav>

            <div className="page-sm" style={{ paddingTop: '40px' }}>

                {/* Page Header */}
                <div style={styles.pageHeader}>
                    <Link href="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
                    <h1 style={styles.pageTitle}>Submit Your Article</h1>
                    <p style={styles.pageSubtitle}>
                        Fill in the details below. Our editorial team will review your submission within 2–5 business days.
                    </p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 style={styles.sectionTitle}>Article Details</h3>

                        <div className="field">
                            <label className="label">Article Title *</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter the full title of your research article"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label className="label">Abstract *</label>
                            <textarea
                                className="input"
                                placeholder="Provide a concise summary of your research (150–300 words recommended)..."
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                style={{ minHeight: '160px' }}
                                required
                            />
                        </div>

                        <div className="field">
                            <label className="label">
                                Keywords
                                <span style={{ color: '#94a3b8', fontWeight: '400', marginLeft: '6px' }}>
                                    (optional)
                                </span>
                            </label>
                            <input
                                className="input"
                                type="text"
                                placeholder="e.g. machine learning, neural networks, NLP (comma separated)"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 style={styles.sectionTitle}>Manuscript File</h3>
                        <p style={styles.sectionDesc}>
                            Accepted formats: PDF, DOC, DOCX — Maximum size: 10MB
                        </p>

                        <div
                            style={{
                                ...styles.uploadZone,
                                borderColor: dragOver ? '#1B3A6B' : '#e2e8f0',
                                background: dragOver ? '#f0f4ff' : '#f8fafc',
                            }}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
                            }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <input
                                id="fileInput"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                            />

                            {file ? (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '40px', marginBottom: '8px' }}>📄</p>
                                    <p style={styles.fileName}>{file.name}</p>
                                    <p style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        style={styles.removeFile}
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>📂</p>
                                    <p style={styles.uploadText}>Click to upload or drag and drop</p>
                                    <p style={styles.uploadHint}>PDF, DOC, DOCX up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={styles.actions}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ maxWidth: '300px' }}
                        >
                            {loading ? 'Submitting...' : 'Submit Article for Review'}
                        </button>
                        <Link href="/dashboard" style={styles.cancelLink}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    pageHeader: {
        marginBottom: '32px',
    },
    backLink: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-block',
        marginBottom: '16px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px',
    },
    pageSubtitle: {
        color: '#64748b',
        fontSize: '15px',
        lineHeight: '1.6',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: '4px',
    },
    sectionDesc: {
        fontSize: '13px',
        color: '#94a3b8',
        marginBottom: '16px',
    },
    uploadZone: {
        border: '2px dashed',
        borderRadius: '12px',
        padding: '48px 24px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    uploadText: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#475569',
        marginBottom: '6px',
    },
    uploadHint: {
        fontSize: '13px',
        color: '#94a3b8',
    },
    fileName: {
        fontWeight: '600',
        color: '#1B3A6B',
        fontSize: '15px',
        marginBottom: '4px',
    },
    fileSize: {
        color: '#94a3b8',
        fontSize: '13px',
        marginBottom: '12px',
    },
    removeFile: {
        background: 'none',
        border: 'none',
        color: '#dc2626',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
    },
    cancelLink: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
    },
};