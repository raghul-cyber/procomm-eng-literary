import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Float } from '@react-three/drei';
import { useRef } from 'react';

const PulsingLight = ({ position, color, speed, intensity }: { position: [number, number, number], color: string, speed: number, intensity: number }) => {
    const lightRef = useRef<any>(null);

    useFrame(({ clock }) => {
        if (lightRef.current) {
            const t = clock.getElapsedTime();
            // Pulse intensity
            lightRef.current.intensity = intensity + Math.sin(t * speed) * (intensity * 0.3);
            // Subtle random movement
            lightRef.current.position.x = position[0] + Math.sin(t * 0.5) * 2;
            lightRef.current.position.z = position[2] + Math.cos(t * 0.5) * 2;
        }
    });

    return <pointLight ref={lightRef} position={position} color={color} intensity={intensity} distance={20} decay={2} />;
};

const Background3D = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: '#050505', // Deep dark background
            overflow: 'hidden'
        }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
                {/* Cinematic Fog */}
                <fog attach="fog" args={['#050505', 5, 25]} />

                {/* Ambient atmosphere */}
                <ambientLight intensity={0.1} />

                {/* Moving, Pulsing Lights for the "Alive" feel */}
                <PulsingLight position={[5, 2, 5]} color="#ff0000" speed={2} intensity={1.5} />
                <PulsingLight position={[-5, -2, -2]} color="#1a1aff" speed={1.5} intensity={0.8} />

                {/* Layered Particles for Depth */}
                <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                    {/* Foreground large particles (Ash) */}
                    <Sparkles
                        count={50}
                        scale={[10, 10, 10]}
                        size={6}
                        speed={0.2}
                        opacity={0.8}
                        color="#ffffff"
                    />
                    {/* Mid-ground density */}
                    <Sparkles
                        count={200}
                        scale={[15, 15, 10]}
                        size={3}
                        speed={0.4}
                        opacity={0.5}
                        color="#aaaaaa"
                    />
                    {/* Background red motes */}
                    <Sparkles
                        count={100}
                        scale={[20, 20, 20]}
                        size={2}
                        speed={0.1}
                        opacity={0.4}
                        color="#ff3333"
                        noise={1}
                    />
                </Float>

                {/* Deep Background Stars */}
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
            </Canvas>

            {/* Heavy Vignette for the "Flashlight" tunnel vision effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 50%, #000000 95%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default Background3D;
