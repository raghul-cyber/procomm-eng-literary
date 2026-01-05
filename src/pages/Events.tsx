// src/pages/Events.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsData } from '../data/eventsData'; // Import the data

const Events = () => {
    const navigate = useNavigate();

    return (
        <div style={{ 
            padding: '4rem 2rem', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
        }}>
            <h1 className="stranger-title" style={{ marginBottom: '4rem', textAlign: 'center' }}>
                Upcoming Events
            </h1>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2.5rem', 
                maxWidth: '1200px', 
                width: '100%' 
            }}>
                {eventsData.map((event, index) => (
                    <div 
                        key={event.id} 
                        className="hawkins-container event-card"
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            height: '100%',
                            animationDelay: `${index * 0.1}s` 
                        }}
                    >
                        <div>
                            <h2 className="stranger-section-title" style={{ 
                                fontSize: '1.5rem', 
                                marginBottom: '1rem',
                                borderBottom: '2px solid rgba(231, 29, 54, 0.5)',
                                transition: 'border-color 0.3s ease'
                            }}>
                                {event.title}
                            </h2>
                            <p style={{ 
                                color: 'var(--color-neon-blue)', 
                                fontFamily: 'var(--font-digital)', 
                                marginBottom: '1rem',
                                letterSpacing: '1px',
                                fontSize: '0.9rem'
                            }}>
                                📅 {event.date} <br/> 
                                📍 {event.location}
                            </p>
                            <p className="stranger-text" style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                                {event.description}
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => navigate(`/events/${event.id}`)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--color-primary)',
                                color: 'var(--color-primary)',
                                padding: '0.8rem 1.5rem',
                                fontFamily: 'var(--font-heading)',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                marginTop: 'auto',
                                alignSelf: 'flex-start',
                                transition: 'all 0.3s ease',
                                letterSpacing: '1px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--color-primary)';
                                e.currentTarget.style.color = '#000';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                        >
                            Join Party
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Events;