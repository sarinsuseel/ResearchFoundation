import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from './lib/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.');
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
          <h1 style={styles.leftTitle}>Analize Statistice Research Foundation</h1>
          <p style={styles.leftSubtitle}>
            Submit, review, and publish peer-reviewed research articles on our secure platform.
          </p>
          <div style={styles.features}>
            {[
              '✦ Secure OTP-based Registration',
              '✦ Fast Editorial Review',
              '✦ Integrated Payment System',
              '✦ Open Access Publishing',
            ].map((f) => (
              <p key={f} style={styles.featureItem}>{f}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>

          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <img src="/logo.png" alt="ASRF" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          </div>

          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSubtitle}>Sign in to your account to continue</p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.registerLink}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={styles.link}>
              Create one here
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
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    color: '#bfdbfe',
    fontSize: '15px',
    fontWeight: '500',
  },
  rightPanel: {
    width: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    background: '#f8fafc',
  },
  formBox: {
    width: '100%',
    maxWidth: '380px',
  },
  mobileLogo: {
    display: 'none',
    marginBottom: '24px',
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
    padding: '0',
  },
  registerLink: {
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