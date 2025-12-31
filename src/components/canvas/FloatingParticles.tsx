"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instance, Instances } from "@react-three/drei";

const COUNT = 400;

function Particle({ index, speed, offset }: { index: number; speed: number; offset: number }) {
    const ref = useRef<any>(null);

    // Initial position
    const initialPosition = useMemo(() => {
        const x = (Math.random() - 0.5) * 35;
        const y = (Math.random() - 0.5) * 25 - 10; // Start lower
        const z = (Math.random() - 0.5) * 20 - 2;
        return new THREE.Vector3(x, y, z);
    }, []);

    useFrame((state) => {
        if (!ref.current) return;

        const t = state.clock.elapsedTime;

        // Upward movement (Embers rising)
        // We cycle y from -15 to +15
        const yCycle = (initialPosition.y + speed * t) % 30;
        const currentY = yCycle - 15;

        // Wobble
        const wobbleX = Math.sin(t * speed + offset) * 0.5;
        const wobbleZ = Math.cos(t * speed * 0.8 + offset) * 0.5;

        ref.current.position.set(
            initialPosition.x + wobbleX,
            currentY,
            initialPosition.z + wobbleZ
        );

        // Rotate/tumble
        ref.current.rotation.x += speed * 0.02;
        ref.current.rotation.y += speed * 0.02;

        // Flicker scale/opacity effect modeled by scale
        const flicker = 0.8 + Math.sin(t * 5 + offset) * 0.2;
        ref.current.scale.setScalar(flicker);
    });

    return <Instance ref={ref} />;
}

export default function FloatingParticles() {
    return (
        <Instances range={COUNT}>
            {/* Cinematic Dust: Tiny octahedrons */}
            <octahedronGeometry args={[0.02, 0]} />
            <meshStandardMaterial
                color="#FFDDDD"
                emissive="#ffaa00"
                emissiveIntensity={1}
                toneMapped={false}
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
            />
            {Array.from({ length: COUNT }).map((_, i) => (
                <Particle
                    key={i}
                    index={i}
                    speed={0.2 + Math.random() * 0.5} // Slower, more floaty
                    offset={Math.random() * 100}
                />
            ))}
        </Instances>
    );
}
