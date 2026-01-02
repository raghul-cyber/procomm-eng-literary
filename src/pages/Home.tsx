import CountdownClock from '../components/CountdownClock/CountdownClock';

const Home = () => {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1 className="stranger-title">Stranger Things</h1>
            <p style={{ marginTop: '2rem', fontSize: '1.5rem' }}>Welcome to the Upside Down.</p>
            <div style={{ marginTop: '3rem' }}>
                <CountdownClock />
            </div>
        </div>
    );
};

export default Home;
