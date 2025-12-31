"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Custom shader for the digital wireframe wave
const fragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying float vElevation;

void main() {
    // Cambodian Flag Colors (Dark Cinematic versions)
    vec3 blue = vec3(0.0, 0.05, 0.2); // VERY Dark Blue
    vec3 red = vec3(0.3, 0.0, 0.05); // VERY Dark Red
    vec3 white = vec3(0.4, 0.4, 0.4); // Dim White
    
    vec3 color = vec3(0.0);
    
    // Stripe logic
    float stripe = vUv.y;
    if (stripe > 0.70 || stripe < 0.30) {
        color = blue;
    } else {
        color = red;
    }
    
    // Center temple hint (white glow)
    float centerDist = distance(vUv, vec2(0.5));
    float templeSDF = smoothstep(0.25, 0.15, centerDist);
    if (stripe > 0.30 && stripe < 0.70) {
         color = mix(color, white, templeSDF * 0.5); // Reduced intensity
    }

    // Add intensity based on wave elevation (peaks are brighter)
    color += vElevation * 0.5; // Reduced elevation brightness

    // Scanline/Grid effect for "Technical/Digital" look handled by wireframe mostly, 
    // but lets add a pulse
    float pulse = sin(uTime * 2.0) * 0.05 + 0.95; // Subtle pulse
    
    gl_FragColor = vec4(color * pulse, 0.4); // Low opacity to blend with black background 
}
`;

const vertexShader = `
uniform float uTime;
varying vec2 vUv;
varying float vElevation;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Complex fluid wave
    float wave1 = sin(pos.x * 1.5 + uTime * 0.8);
    float wave2 = sin(pos.y * 2.5 + uTime * 0.5);
    float wave3 = sin((pos.x + pos.y) * 2.0 + uTime);
    
    float elevation = (wave1 + wave2 + wave3) * 0.15;
    
    pos.z += elevation;
    vElevation = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export default function HolographicFlag() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    const uniforms = {
        uTime: { value: 0 },
    };

    return (
        <mesh ref={meshRef} position={[0, 0, -5]} scale={[16, 10, 1]}>
            {/* High segment count for smooth wireframe waves */}
            <planeGeometry args={[1, 1, 64, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                wireframe={true} // The "Digital" wireframe look
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
}
