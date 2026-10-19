import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from './lib/api';

export default function Register() {
    const router = useRouter();

    // Step 1 = fill details, Step 2 = enter OTP
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Step 1 — Validate and send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email, name });
            setMessage(`OTP sent to ${email}. Check your inbox.`);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — Verify OTP and create account
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password,
                otp,
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            {/* Left Panel */}
            <div style={styles.leftPanel}>
                <div style={styles.leftContent}>
                    <img src="/logo.png" alt="ASRF Logo" style={styles.logo} />
                    <h1 style={styles.leftTitle}>Join Analize Statistice Research Foundation</h1>
                    <p style={styles.leftSubtitle}>
                        Create your account and start publishing your research with the world.
                    </p>
                    <div style={styles.steps}>
                        {[
                            { num: '01', title: 'Create Account', desc: 'Fill in your details and verify email' },
                            { num: '02', title: 'Submit Research', desc: 'Upload your manuscript for review' },
                            { num: '03', title: 'Get Published', desc: 'Go live after approval and payment' },
                        ].map((s) => (
                            <div key={s.num} style={styles.stepItem}>
                                <div style={styles.stepNum}>{s.num}</div>
                                <div>
                                    <p style={styles.stepTitle}>{s.title}</p>
                                    <p style={styles.stepDesc}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={styles.rightPanel}>
                <div style={styles.formBox}>
                    <h2 style={styles.formTitle}>
                        {step === 1 ? 'Create your account' : 'Verify your email'}
                    </h2>
                    <p style={styles.formSubtitle}>
                        {step === 1
                            ? 'Fill in your details to get started'
                            : `Enter the 6-digit OTP sent to ${email}`}
                    </p>

                    {error && <div className="alert-error">{error}</div>}
                    {message && <div className="alert-success">{message}</div>}

                    {/* Step 1 — Details Form */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <div className="field">
                                <label className="label">Full Name *</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Dr. John Smith"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label className="label">Email Address *</label>
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="you@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label className="label">Password *</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingRight: '48px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Confirm Password *</label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                className="btn-primary"
                                type="submit"
                                disabled={loading}
                                style={{ marginTop: '8px' }}
                            >
                                {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
                            </button>
                        </form>
                    )}

                    {/* Step 2 — OTP Form */}
                    {step === 2 && (
                        <form onSubmit={handleRegister}>
                            <div className="field">
                                <label className="label">6-Digit OTP *</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '28px',
                                        letterSpacing: '12px',
                                        fontWeight: '700',
                                    }}
                                    autoFocus
                                    required
                                />
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                    OTP expires in 10 minutes
                                </p>
                            </div>

                            <button
                                className="btn-primary"
                                type="submit"
                                disabled={loading || otp.length < 6}
                                style={{ marginTop: '8px' }}
                            >
                                {loading ? 'Creating account...' : 'Verify & Create Account →'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp('');
                                    setError('');
                                    setMessage('');
                                }}
                                style={styles.backBtn}
                            >
                                ← Go back and edit details
                            </button>
                        </form>
                    )}

                    <p style={styles.loginLink}>
                        Already have an account?{' '}
                        <Link href="/login" style={styles.link}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        display: 'flex',
        minHeight: '100vh',
    },
    leftPanel: {
        flex: 1,
        background: 'linear-gradient(160deg, #0f2547 0%, #1B3A6B 50%, #2E5FA3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
    },
    leftContent: {
        maxWidth: '420px',
    },
    logo: {
        width: '80px',
        height: '80px',
        objectFit: 'contain',
        marginBottom: '24px',
    },
    leftTitle: {
        color: 'white',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '16px',
        lineHeight: '1.3',
    },
    leftSubtitle: {
        color: '#93c5fd',
        fontSize: '16px',
        lineHeight: '1.7',
        marginBottom: '32px',
    },
    steps: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    stepItem: {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    },
    stepNum: {
        background: 'rgba(255,255,255,0.15)',
        color: 'white',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '13px',
        flexShrink: 0,
    },
    stepTitle: {
        color: 'white',
        fontWeight: '600',
        fontSize: '15px',
        marginBottom: '2px',
    },
    stepDesc: {
        color: '#93c5fd',
        fontSize: '13px',
    },
    rightPanel: {
        width: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: '#f8fafc',
        overflowY: 'auto',
    },
    formBox: {
        width: '100%',
        maxWidth: '400px',
    },
    formTitle: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '6px',
    },
    formSubtitle: {
        color: '#64748b',
        fontSize: '15px',
        marginBottom: '28px',
    },
    eyeBtn: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#1B3A6B',
        cursor: 'pointer',
        marginTop: '16px',
        fontSize: '14px',
        width: '100%',
        textAlign: 'center',
        fontWeight: '500',
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#64748b',
    },
    link: {
        color: '#1B3A6B',
        fontWeight: '600',
        textDecoration: 'none',
    },
};