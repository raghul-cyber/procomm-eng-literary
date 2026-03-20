import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

interface Member {
    id: number;
    member_name: string;
    member_email: string;
    member_phone: string;
}

interface Registration {
    id: number;
    event_id: number;
    event_name: string;
    team_name: string;
    college_name: string;
    department: string;
    branch: string;
    team_lead_name: string;
    team_lead_email: string;
    team_lead_phone: string;
    team_size: number;
    registered_at: string;
    members: Member[];
}

interface Stats {
    totalRegistrations: number;
    totalParticipants: number;
    eventBreakdown: { event_name: string; count: number }[];
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [regRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/registrations`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (regRes.status === 401 || regRes.status === 403) {
                localStorage.removeItem('adminToken');
                navigate('/admin');
                return;
            }

            const regData = await regRes.json();
            const statsData = await statsRes.json();

            setRegistrations(regData);
            setStats(statsData);
        } catch (err) {
            setError('Failed to connect to server. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await fetch(`${API_URL}/api/admin/registrations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            setError('Failed to delete registration.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const handleDownloadCSV = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/export/csv`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                setError('Failed to download CSV. Please try again.');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().slice(0, 10);
            a.download = `registrations_${timestamp}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download CSV. Is the backend running?');
        }
    };

    // Filter registrations
    const filtered = registrations.filter(r => {
        const matchesEvent = selectedEvent === 'all' || r.event_name === selectedEvent;
        const matchesSearch = searchTerm === '' ||
            r.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.team_lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.team_lead_email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesEvent && matchesSearch;
    });

    const uniqueEvents = [...new Set(registrations.map(r => r.event_name))];

    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={loadingSpinnerStyle} />
                <p style={{ fontFamily: 'var(--font-digital)', color: '#666', letterSpacing: '2px', fontSize: '0.8rem' }}>
                    ACCESSING DATABASE...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* ═══ TOP BAR ═══ */}
            <div style={topBarStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={dotStyle} />
                    <div>
                        <h1 style={topBarTitleStyle}>ADMIN DASHBOARD</h1>
                        <p style={topBarSubtitleStyle}>HAWKIN'S LAB · COMMAND CENTER</p>
                    </div>
                </div>
                <button onClick={handleLogout} style={logoutBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231, 29, 54, 0.2)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#444'; }}
                >
                    LOGOUT
                </button>
            </div>

            {/* ═══ ERROR ═══ */}
            {error && (
                <div style={errorBannerStyle}>
                    ⚠ {error}
                    <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff6666', cursor: 'pointer', marginLeft: '1rem' }}>✕</button>
                </div>
            )}

            {/* ═══ STAT CARDS ═══ */}
            {stats && (
                <div style={statsGridStyle}>
                    <StatCard
                        label="TOTAL REGISTRATIONS"
                        value={stats.totalRegistrations}
                        icon="📋"
                        accentColor="var(--color-primary)"
                    />
                    <StatCard
                        label="TOTAL PARTICIPANTS"
                        value={stats.totalParticipants}
                        icon="👥"
                        accentColor="var(--color-neon-blue)"
                    />
                    <StatCard
                        label="ACTIVE EVENTS"
                        value={uniqueEvents.length}
                        icon="⚡"
                        accentColor="#a855f7"
                    />
                </div>
            )}

            {/* ═══ EVENT BREAKDOWN ═══ */}
            {stats && stats.eventBreakdown.length > 0 && (
                <div style={sectionContainerStyle}>
                    <h2 style={sectionTitleStyle}>EVENT BREAKDOWN</h2>
                    <div style={eventBreakdownGridStyle}>
                        {stats.eventBreakdown.map((ev, idx) => (
                            <div key={idx} style={eventBarContainerStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#ccc' }}>
                                        {ev.event_name}
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-digital)', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                                        {ev.count}
                                    </span>
                                </div>
                                <div style={eventBarBgStyle}>
                                    <div style={{
                                        ...eventBarFillStyle,
                                        width: `${(ev.count / Math.max(...stats.eventBreakdown.map(e => e.count))) * 100}%`,
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ FILTERS ═══ */}
            <div style={filterContainerStyle}>
                <div style={filterGroupStyle}>
                    <label style={filterLabelStyle}>FILTER BY EVENT</label>
                    <select
                        value={selectedEvent}
                        onChange={e => setSelectedEvent(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="all">All Events</option>
                        {uniqueEvents.map((ev, i) => (
                            <option key={i} value={ev}>{ev}</option>
                        ))}
                    </select>
                </div>
                <div style={filterGroupStyle}>
                    <label style={filterLabelStyle}>SEARCH</label>
                    <input
                        type="text"
                        placeholder="Search by name, college, email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#333'; }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={fetchData} style={refreshBtnStyle}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-neon-blue)'; e.currentTarget.style.color = 'var(--color-neon-blue)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#999'; }}
                    >
                        ↻ REFRESH
                    </button>
                    <button onClick={handleDownloadCSV} style={downloadBtnStyle}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'; e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#999'; }}
                    >
                        ⬇ DOWNLOAD CSV
                    </button>
                </div>
            </div>

            {/* ═══ REGISTRATIONS TABLE ═══ */}
            <div style={tableContainerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={sectionTitleStyle}>REGISTRATIONS ({filtered.length})</h2>
                </div>

                {filtered.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                        <p style={{ fontFamily: 'var(--font-digital)', color: '#666', letterSpacing: '2px', fontSize: '0.8rem' }}>
                            NO REGISTRATIONS FOUND
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    {['#', 'EVENT', 'TEAM', 'LEAD', 'COLLEGE', 'PHONE', 'SIZE', 'DATE', 'ACTIONS'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((reg, idx) => (
                                    <React.Fragment key={reg.id}>
                                        <tr
                                            style={{
                                                ...trStyle,
                                                background: expandedRow === reg.id ? 'rgba(231, 29, 54, 0.08)' : 'transparent',
                                            }}
                                            onMouseEnter={e => {
                                                if (expandedRow !== reg.id) {
                                                    (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (expandedRow !== reg.id) {
                                                    (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                                                }
                                            }}
                                        >
                                            <td style={tdStyle}>{idx + 1}</td>
                                            <td style={{ ...tdStyle, maxWidth: '180px' }}>
                                                <span style={eventBadgeStyle}>{reg.event_name}</span>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 'bold', color: '#fff' }}>{reg.team_name}</td>
                                            <td style={tdStyle}>
                                                <div>{reg.team_lead_name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#888' }}>{reg.team_lead_email}</div>
                                            </td>
                                            <td style={tdStyle}>{reg.college_name}</td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-digital)', fontSize: '0.75rem' }}>{reg.team_lead_phone}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <span style={sizeBadgeStyle}>{reg.team_size}</span>
                                            </td>
                                            <td style={{ ...tdStyle, fontFamily: 'var(--font-digital)', fontSize: '0.7rem', color: '#888' }}>
                                                {new Date(reg.registered_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                                {reg.members.length > 0 && (
                                                    <button
                                                        onClick={() => setExpandedRow(expandedRow === reg.id ? null : reg.id)}
                                                        style={actionBtnStyle}
                                                        title="View Members"
                                                    >
                                                        {expandedRow === reg.id ? '▲' : '▼'}
                                                    </button>
                                                )}
                                                {deleteConfirm === reg.id ? (
                                                    <span style={{ display: 'inline-flex', gap: '0.3rem' }}>
                                                        <button onClick={() => handleDelete(reg.id)} style={{ ...actionBtnStyle, color: '#ff4444', borderColor: '#ff4444' }}>✓</button>
                                                        <button onClick={() => setDeleteConfirm(null)} style={actionBtnStyle}>✕</button>
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(reg.id)}
                                                        style={{ ...actionBtnStyle, color: '#ff6666' }}
                                                        title="Delete"
                                                    >
                                                        🗑
                                                    </button>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Expanded Members Row */}
                                        {expandedRow === reg.id && reg.members.length > 0 && (
                                            <tr>
                                                <td colSpan={9} style={expandedCellStyle}>
                                                    <div style={membersContainerStyle}>
                                                        <p style={membersHeaderStyle}>TEAM MEMBERS</p>
                                                        <div style={membersGridStyle}>
                                                            {reg.members.map((m, i) => (
                                                                <div key={m.id} style={memberCardStyle}>
                                                                    <div style={memberAvatarStyle}>{i + 2}</div>
                                                                    <div>
                                                                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>{m.member_name}</div>
                                                                        <div style={{ color: '#888', fontSize: '0.7rem' }}>{m.member_email}</div>
                                                                        <div style={{ color: 'var(--color-neon-blue)', fontSize: '0.7rem', fontFamily: 'var(--font-digital)' }}>{m.member_phone}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeSlideIn { 
                    from { opacity: 0; transform: translateY(20px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                table tr { animation: fadeSlideIn 0.4s ease; }
            `}</style>
        </div>
    );
};

// ─── Stat Card Component ──────────────────────────────────────
const StatCard = ({ label, value, icon, accentColor }: { label: string; value: number; icon: string; accentColor: string }) => (
    <div style={{
        background: 'rgba(10, 10, 10, 0.9)',
        border: '1px solid #222',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
    }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: accentColor }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#888', letterSpacing: '2px', marginBottom: '0.5rem' }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-digital)', fontSize: '2.2rem', color: accentColor, fontWeight: 'bold' }}>{value}</p>
            </div>
            <span style={{ fontSize: '2rem', opacity: 0.3 }}>{icon}</span>
        </div>
    </div>
);


// ═══ STYLE DEFINITIONS ═══

const containerStyle: React.CSSProperties = {
    padding: '5rem 2rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
};

const topBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #222',
};

const dotStyle: React.CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--color-primary)',
    boxShadow: '0 0 10px var(--color-primary)',
};

const topBarTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.5rem',
    color: '#fff',
    letterSpacing: '3px',
};

const topBarSubtitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-digital)',
    fontSize: '0.6rem',
    color: '#555',
    letterSpacing: '3px',
};

const logoutBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #444',
    color: '#999',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    padding: '0.5rem 1.2rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
};

const errorBannerStyle: React.CSSProperties = {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    padding: '0.8rem 1rem',
    marginBottom: '1.5rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: '#ff6666',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
};

const sectionContainerStyle: React.CSSProperties = {
    background: 'rgba(10, 10, 10, 0.9)',
    border: '1px solid #222',
    padding: '1.5rem',
    marginBottom: '2rem',
};

const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.9rem',
    color: '#ccc',
    letterSpacing: '3px',
    marginBottom: '1rem',
};

const eventBreakdownGridStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
};

const eventBarContainerStyle: React.CSSProperties = {};

const eventBarBgStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    background: '#1a1a1a',
    borderRadius: '3px',
    overflow: 'hidden',
};

const eventBarFillStyle: React.CSSProperties = {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-primary), #ff6b6b)',
    borderRadius: '3px',
    transition: 'width 1s ease',
};

const filterContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
};

const filterGroupStyle: React.CSSProperties = {
    flex: '1',
    minWidth: '200px',
};

const filterLabelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: '0.65rem',
    color: '#888',
    letterSpacing: '2px',
    marginBottom: '0.4rem',
};

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem',
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid #333',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.3s',
};

const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem',
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid #333',
    color: '#fff',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.3s',
};

const refreshBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #444',
    color: '#999',
    fontFamily: 'var(--font-digital)',
    fontSize: '0.7rem',
    letterSpacing: '1px',
    padding: '0.7rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
};

const downloadBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #444',
    color: '#999',
    fontFamily: 'var(--font-digital)',
    fontSize: '0.7rem',
    letterSpacing: '1px',
    padding: '0.7rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
};

const tableContainerStyle: React.CSSProperties = {
    background: 'rgba(10, 10, 10, 0.9)',
    border: '1px solid #222',
    padding: '1.5rem',
};

const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '3rem',
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
    fontFamily: 'var(--font-digital)',
    fontSize: '0.65rem',
    color: '#888',
    letterSpacing: '2px',
    padding: '0.8rem 0.6rem',
    textAlign: 'left',
    borderBottom: '1px solid #333',
    whiteSpace: 'nowrap',
};

const trStyle: React.CSSProperties = {
    transition: 'background 0.2s',
};

const tdStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    color: '#ccc',
    padding: '0.8rem 0.6rem',
    borderBottom: '1px solid #1a1a1a',
    verticalAlign: 'middle',
};

const eventBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(231, 29, 54, 0.1)',
    border: '1px solid rgba(231, 29, 54, 0.3)',
    padding: '0.2rem 0.5rem',
    fontSize: '0.7rem',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-digital)',
    letterSpacing: '0.5px',
};

const sizeBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(0, 243, 255, 0.1)',
    border: '1px solid rgba(0, 243, 255, 0.3)',
    color: 'var(--color-neon-blue)',
    fontFamily: 'var(--font-digital)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
};

const actionBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #333',
    color: '#999',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
    marginLeft: '0.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const expandedCellStyle: React.CSSProperties = {
    padding: 0,
    borderBottom: '1px solid #1a1a1a',
};

const membersContainerStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '1rem 1.5rem',
    borderLeft: '3px solid var(--color-neon-blue)',
    margin: '0 1rem',
};

const membersHeaderStyle: React.CSSProperties = {
    fontFamily: 'var(--font-digital)',
    fontSize: '0.65rem',
    color: 'var(--color-neon-blue)',
    letterSpacing: '2px',
    marginBottom: '0.8rem',
};

const membersGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '0.8rem',
};

const memberCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    background: 'rgba(0, 243, 255, 0.03)',
    border: '1px solid rgba(0, 243, 255, 0.1)',
    padding: '0.6rem',
};

const memberAvatarStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(0, 243, 255, 0.15)',
    border: '1px solid rgba(0, 243, 255, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--color-neon-blue)',
    fontFamily: 'var(--font-digital)',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    flexShrink: 0,
};

const loadingContainerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
};

const loadingSpinnerStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '3px solid #222',
    borderTop: '3px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
};

export default AdminDashboard;
