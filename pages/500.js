import Link from 'next/link';

export default function Custom500() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>500 - Server-side error occurred</h1>
            <p>Sorry! Something went wrong on our end.</p>
            <Link href="/">
                <a>Go back to Home</a>
            </Link>
        </div>
    );
}