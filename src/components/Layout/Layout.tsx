import type { ReactNode } from 'react';
import Footer from './Footer';
import Background3D from '../Background3D/Background3D';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1
        }}>
            <Background3D />
            <main style={{ flex: 1, position: 'relative' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
