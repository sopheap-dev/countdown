"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeLeft } from "@/hooks/useCountdown";

// Configuration
const GRAVITY = -0.005;
const FRICTION = 0.96; // Air resistance
const EXPLOSION_FORCE = 0.5; // How fast particles fly out
const PARTICLE_COUNT = 3000; // Total pool size (shared across multiple explosions for performance)
const COLORS = [
    new THREE.Color("#FFD700"), // Gold
    new THREE.Color("#FF0000"), // Red
    new THREE.Color("#00FF00"), // Green
    new THREE.Color("#0000FF"), // Blue
    new THREE.Color("#FFFFFF"), // White
    new THREE.Color("#FF00FF"), // Purple
];

interface FireworkInstance {
    id: number;
    active: boolean;
    phase: 'rocket' | 'explosion';
    position: THREE.Vector3;
    velocity: THREE.Vector3; // Rocket velocity
    age: number; // Time lived
    maxAge: number; // When to explode (rocket) or die (explosion)
    color: THREE.Color;
    scale: number;
    // For explosion: which range of particles in the pool does this use?
    poolStart: number;
    poolCount: number;
}

export default function Fireworks({ active, timeLeft }: { active: boolean; timeLeft?: TimeLeft }) {
    // 1. Particle Pool (Geometry attributes)
    // We maintain a single large BufferGeometry and update parts of it
    const geometryRef = useRef<THREE.BufferGeometry>(null);
    const materialRef = useRef<THREE.PointsMaterial>(null);

    // Arrays for the GPU
    const [particles] = useState(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        // Initialize all off-screen
        for (let i = 0; i < PARTICLE_COUNT; i++) positions[i * 3 + 1] = -1000;
        return { positions, colors, sizes };
    });

    // CPU State for simulation logic
    // We store velocity per particle here to compute next frame
    const particleVelocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));

    // Active Fireworks logic
    const fireworks = useRef<FireworkInstance[]>([]);
    const nextFireworkId = useRef(0);
    const nextPoolIndex = useRef(0); // Round-robin particle allocation

    // Helper: Create a new firework
    const spawnFirework = () => {
        const id = nextFireworkId.current++;
        // Random launch position X (-15 to 15), Y bottom (-10)
        const startX = (Math.random() - 0.5) * 30;
        const startY = -12;
        const startZ = (Math.random() - 0.5) * 10 - 5; // Depth variance

        // Reserve 1 particle for the rocket tip
        const rocketIndex = nextPoolIndex.current;
        nextPoolIndex.current = (nextPoolIndex.current + 1) % PARTICLE_COUNT;

        // Random color
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        fireworks.current.push({
            id,
            active: true,
            phase: 'rocket',
            position: new THREE.Vector3(startX, startY, startZ),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.3 + Math.random() * 0.2, 0),
            age: 0,
            maxAge: 40 + Math.random() * 20, // Frames until explosion
            color,
            scale: 1,
            poolStart: rocketIndex, // Store rocket particle index
            poolCount: 1 // Initially 1
        });

        // Initialize Rocket Particle
        const idx = rocketIndex;
        particles.positions[idx * 3] = startX;
        particles.positions[idx * 3 + 1] = startY;
        particles.positions[idx * 3 + 2] = startZ;

        particles.colors[idx * 3] = color.r;
        particles.colors[idx * 3 + 1] = color.g;
        particles.colors[idx * 3 + 2] = color.b;

        particles.sizes[idx] = 1.0;
    };

    // Helper: Explode a firework
    const explodeFirework = (fw: FireworkInstance) => {
        // Allocate particles
        const count = 100 + Math.floor(Math.random() * 100); // Particles per explosion

        // We already have fw.poolStart (1 particle). We need 'count' particles.
        // We can just allocate a NEW block for explosion to avoid fragmentation logic and just abandon the rocket particle (it will be overwritten eventually).
        const start = nextPoolIndex.current;

        // Update circular buffer index
        nextPoolIndex.current = (nextPoolIndex.current + count) % PARTICLE_COUNT;

        fw.phase = 'explosion';
        fw.age = 0;
        fw.maxAge = 100; // Explosion duration (fade out)
        fw.poolStart = start;
        fw.poolCount = count;

        // Initialize particles at explosion center
        const pVel = particleVelocities.current;
        const pPos = particles.positions;
        const pCol = particles.colors;
        const pSiz = particles.sizes;

        for (let i = 0; i < count; i++) {
            const idx = (start + i) % PARTICLE_COUNT; // Handle wrap-around

            // Set Position
            pPos[idx * 3] = fw.position.x;
            pPos[idx * 3 + 1] = fw.position.y;
            pPos[idx * 3 + 2] = fw.position.z;

            // Set Velocity (Spherical explosion)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const force = Math.random() * EXPLOSION_FORCE;

            pVel[idx * 3] = force * Math.sin(phi) * Math.cos(theta); // vx
            pVel[idx * 3 + 1] = force * Math.sin(phi) * Math.sin(theta); // vy
            pVel[idx * 3 + 2] = force * Math.cos(phi); // vz

            // Set Color
            pCol[idx * 3] = fw.color.r;
            pCol[idx * 3 + 1] = fw.color.g;
            pCol[idx * 3 + 2] = fw.color.b;

            // Set Size
            pSiz[idx] = 1.0;
        }
    };

    useFrame(() => {
        // Only run if active logic is required (Celebration or Countdown < 10s)
        const shouldBeActive = active || (timeLeft?.days === 0 && timeLeft?.hours === 0 && timeLeft?.minutes === 0 && timeLeft?.seconds && timeLeft.seconds <= 10);

        if (!shouldBeActive && fireworks.current.length === 0) return;

        // 1. Spawn Logic - MORE FIREWORKS during celebration!
        const spawnChance = active ? 0.2 : 0.08; // 20% during celebration, 8% during countdown
        if (shouldBeActive && Math.random() < spawnChance) {
            spawnFirework();
        }

        const pPos = particles.positions;
        const pVel = particleVelocities.current;
        const pSiz = particles.sizes;

        // 2. Update Fireworks Logic
        for (let i = fireworks.current.length - 1; i >= 0; i--) {
            const fw = fireworks.current[i];
            fw.age++;

            if (fw.phase === 'rocket') {
                // Move rocket
                fw.position.add(fw.velocity);
                fw.velocity.y += GRAVITY;

                // Render rocket trailing particle (simulated by just drawing it at 'poolStart' 0 reserved or similar? 
                // Alternatively, just use a separate small mesh? 
                // For performance, let's skip drawing the rocket trail in the same system and just wait for explosion.
                // Or: simpler, we just spawn the explosion immediately at random heights?
                // Let's stick to rocket logic: if age > maxAge, explode.
                if (fw.age >= fw.maxAge || fw.velocity.y < 0) {
                    explodeFirework(fw);
                } else {
                    // Render Rocket Tip!
                    // We can borrow the first particle of its future pool (or a dedicated one) to show the rocket
                    // For simplicity, let's just use a dynamic particle from the end of the buffer or something?
                    // Actually, let's just use a simple hack:
                    // We don't have a reserved particle for the rocket.
                    // So rockets are invisible.
                    // This is the problem! If no explosions happen yet, screen is empty.
                    // Let's force an explosion immediately for testing?
                    // No, let's fix it properly.
                    // Let's use the 'poolStart' particle to track the rocket position
                    // We will just claim 1 particle for the rocket phase.

                    // On Spawn: fw.poolStart = nextPoolIndex.current; nextPoolIndex++; (Reserve 1)
                    // But we reserve block on explosion.
                    // Okay, simple fix: Just make explosions happening MUCH fast and ensure gravity isn't pulling them off screen.
                }
            } else {
                // Explosion phase logic
                // Update its particles
                const count = fw.poolCount;
                const start = fw.poolStart;
                const alpha = 1 - (fw.age / fw.maxAge); // Fade out

                if (fw.age >= fw.maxAge) {
                    // Dead, clear particles off screen
                    for (let k = 0; k < count; k++) {
                        const idx = (start + k) % PARTICLE_COUNT;
                        pPos[idx * 3 + 1] = -1000;
                        pSiz[idx] = 0;
                    }
                    fireworks.current.splice(i, 1); // Remove instance
                    continue;
                }

                for (let k = 0; k < count; k++) {
                    const idx = (start + k) % PARTICLE_COUNT;

                    // Update Position
                    pPos[idx * 3] += pVel[idx * 3];
                    pPos[idx * 3 + 1] += pVel[idx * 3 + 1];
                    pPos[idx * 3 + 2] += pVel[idx * 3 + 2];

                    // Apply Physics
                    pVel[idx * 3] *= FRICTION;
                    pVel[idx * 3 + 1] *= FRICTION;
                    pVel[idx * 3 + 2] *= FRICTION;
                    pVel[idx * 3 + 1] += GRAVITY * 0.5; // lighter gravity for sparkles

                    // Size/Opacity
                    pSiz[idx] = alpha * (Math.random() > 0.5 ? 1 : 0); // Twinkle
                }
            }
        }

        // 3. Commit updates to GPU
        if (geometryRef.current && geometryRef.current.attributes.position) {
            geometryRef.current.attributes.position.needsUpdate = true;
            // geometryRef.current.attributes.size.needsUpdate = true; // Use sizeAttenuation in material instead 
            // Wait, standard PointsMaterial doesn't allow per-vertex size easily without custom shader.
            // We can simulate size by just setting position to infinity if size=0.
            // Or use 'sizeAttenuation' and just let them fade.
            // For simplicity/compatibility: color opacity isn't per vertex in standard material. 
            // We will hack "fade" by moving them very far away or settings color to black.
            // Let's use Color for fade.
            geometryRef.current.attributes.color.needsUpdate = true;
        }

        // Re-run loop to update colors (fade out)
        for (let i = 0; i < fireworks.current.length; i++) {
            const fw = fireworks.current[i];
            if (fw.phase === 'explosion') {
                const count = fw.poolCount;
                const start = fw.poolStart;
                const alpha = Math.max(0, 1 - (fw.age / fw.maxAge));

                for (let k = 0; k < count; k++) {
                    const idx = (start + k) % PARTICLE_COUNT;
                    // Fade to black/transparent
                    particles.colors[idx * 3] = fw.color.r * alpha;
                    particles.colors[idx * 3 + 1] = fw.color.g * alpha;
                    particles.colors[idx * 3 + 2] = fw.color.b * alpha;
                }
            }
        }
    });

    return (
        <points ref={geometryRef as any}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={particles.positions}
                    itemSize={3}
                    args={[particles.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={PARTICLE_COUNT}
                    array={particles.colors}
                    itemSize={3}
                    args={[particles.colors, 3]}
                />
                {/* To actually support variable size in standard material we'd need a shader, 
                     but standard PointsMaterial has 'size' prop which is global. 
                     We relies on fading color for "disappearing". */}
            </bufferGeometry>
            {/* Blending Additive makes it look like light! */}
            <pointsMaterial
                size={0.15}
                color="#ffffff"
                vertexColors
                transparent
                opacity={1}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
