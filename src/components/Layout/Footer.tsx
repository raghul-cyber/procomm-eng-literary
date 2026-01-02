import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            padding: '2rem',
            borderTop: '1px solid var(--color-primary)',
            backgroundColor: '#0a0a0a',
            marginTop: 'auto'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem'
            }}>
                <Link to="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
                <Link to="/events" style={{ color: 'var(--color-text)' }}>Events</Link>
                <Link to="/about" style={{ color: 'var(--color-text)' }}>About</Link>
                <Link to="/commitee" style={{ color: 'var(--color-text)' }}>Committee</Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.5, fontSize: '0.8rem' }}>
                IEEE Procomm English Literary Club
            </div>
        </footer>
    );
};

export default Footer;
