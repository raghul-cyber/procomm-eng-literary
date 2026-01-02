import React from 'react';

const Events = () => {
    return (
        <div style={{ padding: '4rem 2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="stranger-title" style={{ marginBottom: '4rem', textAlign: 'center' }}>Events</h1>

            <div className="hawkins-container" style={{ maxWidth: '1200px', width: '100%' }}>
                <p className="stranger-text" style={{ textAlign: 'center' }}>
                    Upcoming events from IEEE Procomm.
                </p>
                <br />
                <p className="stranger-text" style={{ textAlign: 'center' }}>
                    More mysteries unfolding soon...
                </p>
            </div>
        </div>
    );
};

export default Events;
