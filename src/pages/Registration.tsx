import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsData } from '../data/eventsData';

const Registration = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = eventsData.find(e => e.id === Number(id));

    // Form State
    const [formData, setFormData] = useState({
        teamName: '',
        collegeName: '',
        department: '',
        branch: '',
        teamLeadName: '',
        teamLeadEmail: '', // Added Lead Email
        teamLeadPhone: '',
        teamSize: 1
    });

    // Dynamic State for Additional Members (Added Phone)
    const [members, setMembers] = useState<{ name: string; email: string; phone: string }[]>([]);

    // Handle Team Size Change (Dropdown Logic)
    const handleTeamSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const size = parseInt(e.target.value);
        setFormData({ ...formData, teamSize: size });

        // Calculate how many EXTRA members we need (Total - 1 Team Lead)
        const extraMembersCount = Math.max(0, size - 1);
        
        // Resize the members array
        setMembers(prev => {
            const newMembers = [...prev];
            if (newMembers.length < extraMembersCount) {
                // Add new empty slots with phone field
                while (newMembers.length < extraMembersCount) {
                    newMembers.push({ name: '', email: '', phone: '' });
                }
            } else {
                // Trim the array
                newMembers.length = extraMembersCount;
            }
            return newMembers;
        });
    };

    // Handle Dynamic Member Inputs
    const handleMemberChange = (index: number, field: string, value: string) => {
        const updatedMembers = [...members];
        // @ts-ignore
        updatedMembers[index] = { ...updatedMembers[index], [field]: value };
        setMembers(updatedMembers);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ ...formData, members }); // For debugging
        alert("Transmission Sent to Hawkins Lab.");
        navigate('/');
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    if (!event) return <div>Event not found</div>;

    return (
        <div style={{ 
            padding: '4rem 2rem', 
            minHeight: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            <div className="hawkins-container" style={{ maxWidth: '800px', width: '100%', padding: '3rem' }}>
                
                {/* Header */}
                <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h1 className="stranger-section-title" style={{ fontSize: '1.8rem', border: 'none', margin: 0 }}>
                        Registration Form
                    </h1>
                    <p style={{ color: 'var(--color-neon-blue)', fontFamily: 'var(--font-digital)', marginTop: '0.5rem' }}>
                        EVENT CODE: {event.title.toUpperCase()}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Section 1: Team & College Info */}
                    <h3 style={sectionHeaderStyle}>Team Identity</h3>
                    <div style={gridStyle}>
                        <InputGroup label="Team Name" value={formData.teamName} onChange={(e: any) => setFormData({...formData, teamName: e.target.value})} />
                        <InputGroup label="College Name" value={formData.collegeName} onChange={(e: any) => setFormData({...formData, collegeName: e.target.value})} />
                        <InputGroup label="Department" value={formData.department} onChange={(e: any) => setFormData({...formData, department: e.target.value})} />
                        <InputGroup label="Branch / Year" value={formData.branch} onChange={(e: any) => setFormData({...formData, branch: e.target.value})} />
                    </div>

                    {/* Section 2: Team Lead */}
                    <h3 style={sectionHeaderStyle}>Team Lead (Main Contact)</h3>
                    <div style={gridStyle}>
                        <InputGroup label="Lead Name" value={formData.teamLeadName} onChange={(e: any) => setFormData({...formData, teamLeadName: e.target.value})} />
                        <InputGroup label="Lead Phone" type="tel" value={formData.teamLeadPhone} onChange={(e: any) => setFormData({...formData, teamLeadPhone: e.target.value})} />
                        {/* Added Lead Email */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <InputGroup label="Lead Email ID" type="email" value={formData.teamLeadEmail} onChange={(e: any) => setFormData({...formData, teamLeadEmail: e.target.value})} />
                        </div>
                    </div>

                    {/* Section 3: Team Configuration */}
                    <h3 style={sectionHeaderStyle}>Team Configuration</h3>
                    
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '3px solid var(--color-primary)' }}>
                        <label style={labelStyle}>Number of Team Members (Including Lead)</label>
                        
                        {/* CHANGED: Dropdown for 1-4 Members */}
                        <select 
                            value={formData.teamSize} 
                            onChange={handleTeamSizeChange}
                            style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                        >
                            <option value={1}>1 Member (Lead)</option>
                            <option value={2}>2 Members</option>
                            <option value={3}>3 Members</option>
                            <option value={4}>4 Members</option>
                        </select>

                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                            *Select total team size. Forms will appear below for additional members.
                        </p>
                    </div>

                    {/* Dynamic Member Fields */}
                    {members.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease' }}>
                            {members.map((member, index) => (
                                <div key={index} style={{ 
                                    padding: '1rem', 
                                    border: '1px dashed #444', 
                                    marginTop: '1rem',
                                    position: 'relative'
                                }}>
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: '-10px', 
                                        left: '10px', 
                                        background: '#000', 
                                        padding: '0 5px', 
                                        color: 'var(--color-neon-blue)', 
                                        fontSize: '0.8rem',
                                        fontFamily: 'var(--font-digital)'
                                    }}>
                                        MEMBER 0{index + 2} DATA
                                    </span>
                                    
                                    {/* Updated Grid to include Phone */}
                                    <div style={gridStyle}>
                                        <InputGroup 
                                            label={`Member ${index + 2} Name`} 
                                            value={member.name} 
                                            onChange={(e: any) => handleMemberChange(index, 'name', e.target.value)} 
                                        />
                                        <InputGroup 
                                            label={`Member ${index + 2} Phone`} 
                                            type="tel"
                                            value={member.phone} 
                                            onChange={(e: any) => handleMemberChange(index, 'phone', e.target.value)} 
                                        />
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <InputGroup 
                                                label={`Member ${index + 2} Email`} 
                                                type="email"
                                                value={member.email} 
                                                onChange={(e: any) => handleMemberChange(index, 'email', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)} 
                            style={cancelButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#fff';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#666';
                                e.currentTarget.style.color = '#ccc';
                            }}
                        >
                            Cancel
                        </button>

                        <button 
                            type="submit" 
                            style={submitButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--color-primary)';
                                e.currentTarget.style.color = '#000';
                            }}
                        >
                            Submit Registration
                        </button>
                    </div>

                </form>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// --- Styles & Components ---

const InputGroup = ({ label, value, onChange, type = "text" }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={labelStyle}>{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            required 
            style={inputStyle} 
        />
    </div>
);

const sectionHeaderStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    color: '#ccc',
    fontSize: '1.2rem',
    marginTop: '1rem',
    borderBottom: '1px solid #333'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
};

const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const inputStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #444',
    color: '#fff',
    padding: '0.8rem',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s'
};

const buttonBaseStyle: React.CSSProperties = {
    flex: '1',
    padding: '1rem',
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.3s',
    textAlign: 'center'
};

const submitButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: 'var(--color-primary)',
    color: '#000',
    border: '1px solid var(--color-primary)',
    fontWeight: 'bold',
    boxShadow: '0 0 15px var(--color-primary)'
};

const cancelButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: 'transparent',
    color: '#ccc',
    border: '1px solid #666',
};

export default Registration;