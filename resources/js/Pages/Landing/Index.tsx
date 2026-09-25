import { Head, Link } from '@inertiajs/react';

export default function LandingIndex() {
    return (
        <>
            <Head title="WASH 5W Platform" />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0B3C46,#12707E)', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                <div style={{ textAlign: 'center', maxWidth: 560, padding: '0 24px' }}>
                    <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>WASH 5W Platform</h1>
                    <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 32 }}>
                        NE Nigeria WASH Sector Coordination — Laravel + Inertia backend is live ✓
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/login" style={{ background: '#C1722F', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                            Sign In
                        </Link>
                        <Link href="/register" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
