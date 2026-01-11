'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Cube, Cylinder, Sphere } from 'lucide-react'; // Placeholder icons for now

interface MeshViewerProps {
    modelUrl?: string; // For now we'll just show primitive shapes as demonstration
    type?: 'cube' | 'sphere' | 'cylinder';
}

function MeshScene({ type }: { type: string }) {
    return (
        <Stage environment="city" intensity={0.6}>
            {type === 'cube' && (
                <mesh>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="orange" roughness={0.3} metalness={0.8} />
                </mesh>
            )}
            {type === 'sphere' && (
                <mesh>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="#4f46e5" roughness={0.1} metalness={0.5} />
                </mesh>
            )}
            {/* Default fallback */}
            {!['cube', 'sphere'].includes(type) && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                    <meshStandardMaterial color="#10b981" roughness={0.2} metalness={1} />
                </mesh>
            )}
        </Stage>
    );
}

export function MeshViewer({ type = 'complex' }: MeshViewerProps) {
    return (
        <div className="w-full h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-white/10 relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur px-3 py-1 rounded text-xs font-mono text-white/70 flex items-center gap-2">
                <span>3D Mesh View</span>
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
            </div>

            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <MeshScene type={type} />
                <OrbitControls makeDefault />
            </Canvas>

            <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="bg-black/40 backdrop-blur-md p-2 rounded-md border border-white/10 text-xs text-muted-foreground">
                    Left Click: Rotate • Right Click: Pan • Scroll: Zoom
                </div>
            </div>
        </div>
    );
}
