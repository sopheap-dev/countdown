"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CONFETTI_COUNT = 500;

export default function Confetti({ active }: { active: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(CONFETTI_COUNT * 3);
        const colors = new Float32Array(CONFETTI_COUNT * 3);
        const velocities: THREE.Vector3[] = [];
        const rotations: number[] = [];
        const rotationSpeeds: number[] = [];

        const confettiColors = [
            new THREE.Color("#FFD700"), // Gold
            new THREE.Color("#FF0000"), // Red
            new THREE.Color("#00FF00"), // Green
            new THREE.Color("#0000FF"), // Blue
            new THREE.Color("#FF00FF"), // Magenta
            new THREE.Color("#00FFFF"), // Cyan
            new THREE.Color("#FFFFFF"), // White
        ];

        for (let i = 0; i < CONFETTI_COUNT; i++) {
            // Start from top
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = 15 + Math.random() * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            // Random velocity
            velocities.push(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    -0.05 - Math.random() * 0.05, // Falling
                    (Math.random() - 0.5) * 0.1
                )
            );

            // Random color
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Rotation for flutter effect
            rotations.push(Math.random() * Math.PI * 2);
            rotationSpeeds.push((Math.random() - 0.5) * 0.1);
        }

        return { positions, colors, velocities, rotations, rotationSpeeds };
    }, []);

    useFrame(() => {
        if (!active || !pointsRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < CONFETTI_COUNT; i++) {
            // Update position
            positions[i * 3] += particles.velocities[i].x;
            positions[i * 3 + 1] += particles.velocities[i].y;
            positions[i * 3 + 2] += particles.velocities[i].z;

            // Add flutter (sine wave motion)
            particles.rotations[i] += particles.rotationSpeeds[i];
            positions[i * 3] += Math.sin(particles.rotations[i]) * 0.02;

            // Reset if fallen too low
            if (positions[i * 3 + 1] < -15) {
                positions[i * 3] = (Math.random() - 0.5) * 40;
                positions[i * 3 + 1] = 15 + Math.random() * 5;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            }

            // Slight gravity
            particles.velocities[i].y -= 0.001;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={CONFETTI_COUNT}
                    array={particles.positions}
                    itemSize={3}
                    args={[particles.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={CONFETTI_COUNT}
                    array={particles.colors}
                    itemSize={3}
                    args={[particles.colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.3}
                vertexColors
                transparent
                opacity={0.9}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
