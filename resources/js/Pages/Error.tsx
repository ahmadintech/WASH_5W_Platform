import { Head } from '@inertiajs/react';

export default function ErrorPage({ status }: { status: number }) {
    const messages: Record<number, string> = {
        403: "You don't have permission to access this page.",
        404: "The page you're looking for doesn't exist.",
        500: "Something went wrong on our end.",
        503: "Service temporarily unavailable.",
    };
    return (
        <>
            <Head title={`Error ${status}`} />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B3C46', color: '#fff', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: 80, fontWeight: 700, opacity: 0.2 }}>{status}</div>
                    <p style={{ fontSize: 18, marginTop: 16 }}>{messages[status] || 'An error occurred.'}</p>
                    <a href="/" style={{ display: 'inline-block', marginTop: 24, background: '#12707E', color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none' }}>Go Home</a>
                </div>
            </div>
        </>
    );
}
