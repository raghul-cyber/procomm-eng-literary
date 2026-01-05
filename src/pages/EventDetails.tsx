import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsData } from '../data/eventsData'; 

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = eventsData.find(e => e.id === Number(id));
    
    // State to handle image load error
    const [imageError, setImageError] = useState(false);

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!event) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#fff' }}>
                <h1 className="stranger-title">404</h1>
                <p>Event not found in this dimension.</p>
                <button onClick={() => navigate('/events')} style={{ marginTop: '2rem', background: 'var(--color-primary)', border: 'none', padding: '1rem', cursor: 'pointer' }}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
            
            <div className="hawkins-container" style={{ 
                maxWidth: '1000px', 
                width: '100%', 
                position: 'relative', 
                padding: '3rem',
                border: '1px solid #444',
                // FIX: Ensure overflow is visible so the rotated image isn't clipped
                overflow: 'visible' 
            }}>
                
                {/* 1. Header with Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '1rem' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--color-primary)', 
                            fontSize: '2rem', 
                            cursor: 'pointer',
                            marginRight: '1rem'
                        }}
                    >
                        ←
                    </button>
                    <h1 style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontSize: 'clamp(1.5rem, 5vw, 3rem)', 
                        color: '#fff', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px',
                        textShadow: '0 0 10px var(--color-primary)'
                    }}>
                        {event.title}
                    </h1>
                </div>

                {/* 2. Top Section: Details & Image */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: '3rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                    
                    {/* Left: Text Details */}
                    <div style={{ flex: '1 1 400px' }}>
                        <h2 className="stranger-section-title">Event Details</h2>
                        <p className="stranger-text" style={{ marginBottom: '1.5rem', color: '#ccc' }}>
                            {event.fullDescription || event.description}
                        </p>
                        
                        <div style={{ fontFamily: 'var(--font-digital)', color: 'var(--color-neon-blue)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                            <p><strong>Team Size:</strong> {event.teamSize}</p>
                            <p><strong>Venue:</strong> {event.venue}</p>
                            <p><strong>Time:</strong> {event.time}</p>
                        </div>
                    </div>

                    {/* Right: Poster/Image - FIXED VISIBILITY */}
                    <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
                        <div style={{ 
                            border: '4px solid #fff', 
                            padding: '5px', 
                            background: '#000', 
                            transform: 'rotate(2deg)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                            transition: 'transform 0.3s ease'
                        }}
                        className="event-image-container"
                        >
                            <img 
                                src={imageError ? 'https://via.placeholder.com/400x600/000000/ff0000?text=TOP+SECRET' : event.image} 
                                alt={event.title} 
                                onError={() => setImageError(true)}
                                style={{ 
                                    width: '100%', 
                                    height: 'auto', 
                                    minHeight: '200px',
                                    display: 'block', 
                                    filter: 'sepia(30%) contrast(110%)',
                                    objectFit: 'cover'
                                }} 
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Instructions & Eligibility */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 className="stranger-section-title">Instructions</h2>
                    <p className="stranger-text" style={{ marginBottom: '2rem' }}>{event.instructions}</p>

                    <h2 className="stranger-section-title">Eligibility</h2>
                    <p className="stranger-text">{event.eligibility}</p>
                </div>

                {/* 4. Rounds */}
                <h2 className="stranger-section-title">Rounds</h2>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    {event.rounds && event.rounds.map((round: any, idx: number) => (
                        <div key={idx} style={{ 
                            border: '1px solid var(--color-primary)', 
                            padding: '1.5rem', 
                            background: 'rgba(231, 29, 54, 0.05)',
                            position: 'relative'
                        }}>
                            <h3 style={{ 
                                fontFamily: 'var(--font-heading)', 
                                color: 'var(--color-primary)', 
                                marginBottom: '0.5rem', 
                                fontSize: '1.5rem' 
                            }}>
                                {round.name}
                            </h3>
                            <p style={{ fontFamily: 'var(--font-digital)', color: 'var(--color-neon-blue)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Mode: {round.mode} | Date: {round.date}
                            </p>
                            <p className="stranger-text" style={{ fontSize: '0.95rem' }}>{round.desc}</p>
                        </div>
                    ))}
                </div>

                {/* 5. Registration Buttons */}
                <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => navigate(`/register/${event.id}`)}
                        style={buttonStyle}
                    >
                        Register Now
                    </button>
                    <button style={{ ...buttonStyle, background: 'transparent', color: '#fff', borderColor: '#fff' }}>
                        Event Brochure
                    </button>
                </div>

                {/* 6. Coordinators */}
                <div style={{ borderTop: '1px dashed #666', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
                    <div>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Student Coordinators</h3>
                        {event.coordinators && event.coordinators.student.map((c: string, i: number) => (
                            <p key={i} className="stranger-text" style={{ fontSize: '0.9rem' }}>{c}</p>
                        ))}
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Staff Coordinator</h3>
                        {event.coordinators && event.coordinators.staff.map((c: string, i: number) => (
                            <p key={i} className="stranger-text" style={{ fontSize: '0.9rem' }}>{c}</p>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: '#000',
    border: '1px solid var(--color-primary)',
    padding: '1rem 2rem',
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 10px var(--color-primary)',
    transition: 'all 0.3s ease'
};

export default EventDetails;