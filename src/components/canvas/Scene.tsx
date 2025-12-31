"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
import { CameraShake } from "@react-three/drei";
import FloatingParticles from "./FloatingParticles";
import HolographicFlag from "./HolographicFlag";
import Fireworks from "./Fireworks";
import { useRef } from "react";
import * as THREE from "three";

import { TimeLeft } from "@/hooks/useCountdown";

interface SceneProps {
    isNewYear: boolean;
    timeLeft: TimeLeft;
}

function HeartbeatLight() {
    const light = useRef<THREE.AmbientLight>(null);
    useFrame((state) => {
        if (light.current) {
            // "Heartbeat" pulse every second
            const t = state.clock.elapsedTime;
            const pulse = Math.sin(t * Math.PI * 2); // 1Hz beat
            // Keep base high enough, pulse adds a bit of brightness
            light.current.intensity = 0.5 + Math.max(0, pulse) * 0.2;
        }
    });
    return <ambientLight ref={light} intensity={0.5} />;
}

export default function Scene({ isNewYear, timeLeft }: SceneProps) {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 12], fov: 35 }} // Zoomed in a bit for cinematic feel
                gl={{ antialias: false, alpha: true }}
                dpr={[1, 1.5]}
            >
                {/* <color attach="background" args={["#000005"]} />  Removed for transparent bg */}

                {/* Lights */}
                <HeartbeatLight />
                <pointLight position={[10, 10, 10]} intensity={1} color="#4488ff" />
                <pointLight position={[-10, -5, -10]} intensity={0.5} color="#ff4444" />

                {/* Objects */}
                <FloatingParticles />
                {/* <HolographicFlag /> Removed as image has flag */}
                <Fireworks active={isNewYear} timeLeft={timeLeft} />

                {/* Post Processing */}
                <EffectComposer enableNormalPass={false}>
                    {/* Depth of Field for cinematic look */}
                    <DepthOfField
                        focusDistance={0}
                        focalLength={0.02}
                        bokehScale={5}
                        height={480}
                    />
                    <Bloom
                        luminanceThreshold={0.2}
                        mipmapBlur
                        intensity={1.5}
                        radius={0.6}
                    />
                    <Noise opacity={0.15} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

                <CameraShake
                    maxYaw={0.05}
                    maxPitch={0.05}
                    maxRoll={0.05}
                    yawFrequency={0.1}
                    pitchFrequency={0.1}
                    rollFrequency={0.1}
                    intensity={1}
                />
            </Canvas>
        </div>
    );
}
