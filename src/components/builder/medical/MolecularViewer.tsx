'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { TaskComponent } from '../types';
import { Dna, Activity, Search } from 'lucide-react';

interface MolecularViewerProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
}

// Procedural Molecule Generator (Mock .PDB loader)
function Molecule({ count = 20 }) {
    const atoms = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                position: [
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                ],
                color: Math.random() > 0.5 ? '#ef4444' : (Math.random() > 0.5 ? '#3b82f6' : '#eab308'),
                size: 0.5 + Math.random() * 0.5,
                id: i
            });
        }
        return temp;
    }, [count]);

    // Generate bonds
    const bonds = useMemo(() => {
        const temp = [];
        for (let i = 0; i < atoms.length - 1; i++) {
            if (Math.random() > 0.6) {
                temp.push({ start: atoms[i].position, end: atoms[i + 1].position });
            }
        }
        return temp;
    }, [atoms]);

    return (
        <group>
            {atoms.map((atom, i) => (
                <mesh key={i} position={atom.position as [number, number, number]}>
                    <sphereGeometry args={[atom.size, 32, 32]} />
                    <meshStandardMaterial color={atom.color} roughness={0.3} metalness={0.2} />
                </mesh>
            ))}
            {bonds.map((bond, i) => {
                // Calculation for cylinder orientation would go here in full version
                // For simplified view, we just draw lines
                return (
                    <line key={`bond-${i}`}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={2}
                                array={new Float32Array([...bond.start, ...bond.end])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial color="#cccccc" linewidth={2} opacity={0.5} transparent />
                    </line>
                );
            })}
        </group>
    );
}

export function MolecularViewer({ component, value, readOnly }: MolecularViewerProps) {
    return (
        <div className="w-full h-[600px] border border-white/10 rounded-lg overflow-hidden relative bg-black">
            {/* Header / Tools */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur p-2 rounded-lg border border-white/10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 px-1">
                    <Dna size={16} /> Molecular View
                </div>
                <div className="text-[10px] text-muted-foreground px-1 uppercase tracking-wider">Structure ID: 1BNA</div>

                <div className="flex gap-1 mt-2">
                    <button className="p-1.5 rounded bg-white/10 hover:bg-white/20" title="Highlight Active Site"><Search size={14} /></button>
                    <button className="p-1.5 rounded bg-white/10 hover:bg-white/20" title="Toggle Surface"><Activity size={14} /></button>
                </div>
            </div>

            <Canvas shadows camera={{ position: [0, 0, 25], fov: 45 }}>
                <color attach="background" args={['#050505']} />

                <Stage environment="city" intensity={0.5}>
                    <Molecule count={40} />
                </Stage>

                <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault />
            </Canvas>

            <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-xs text-muted-foreground border border-white/10">
                L-Tryptophan (Simulated)
            </div>
        </div>
    );
}
