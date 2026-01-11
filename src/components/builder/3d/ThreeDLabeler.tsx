'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Html, Points, PointMaterial, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { TaskComponent } from '../types';
import { Box, Move, Maximize, RotateCw, Plus, Trash2, Layers } from 'lucide-react';
import { nanoid } from 'nanoid';

// --- Types ---

interface Box3D {
    id: string;
    label: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}

interface ThreeDLabelerProps {
    src?: string; // URL to point cloud data (mocked for now)
    component: TaskComponent;
    value: Box3D[];
    onChange: (value: Box3D[]) => void;
    readOnly?: boolean;
}

// --- Helper Components ---

function PointCloud({ count = 50000 }: { count?: number }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        const c = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // Create a donut/scanning shape
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 20; // 10 to 30 units radius
            const y = (Math.random() - 0.5) * 5;     // +/- 2.5 height

            p[i * 3] = Math.cos(angle) * radius;
            p[i * 3 + 1] = y;
            p[i * 3 + 2] = Math.sin(angle) * radius;

            // Color gradient based on height
            color.setHSL(0.6, 0.8, (y + 2.5) / 5);
            c[i * 3] = color.r;
            c[i * 3 + 1] = color.g;
            c[i * 3 + 2] = color.b;
        }
        return { positions: p, colors: c };
    }, [count]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[points.colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
}

function LabelableBox({
    box,
    isSelected,
    onSelect,
    onChange,
    readOnly,
    activeLabel
}: {
    box: Box3D;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (id: string, updates: Partial<Box3D>) => void;
    readOnly?: boolean;
    activeLabel?: { value: string, background: string };
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

    // Update color if label definition changes for this box
    const color = box.color || '#ffffff';

    return (
        <>
            {isSelected && !readOnly && (
                <TransformControls
                    object={meshRef}
                    mode={mode}
                    onObjectChange={(e) => {
                        if (meshRef.current) {
                            onChange(box.id, {
                                position: meshRef.current.position.toArray() as [number, number, number],
                                rotation: [
                                    meshRef.current.rotation.x,
                                    meshRef.current.rotation.y,
                                    meshRef.current.rotation.z
                                ],
                                scale: meshRef.current.scale.toArray() as [number, number, number],
                            });
                        }
                    }}
                />
            )}

            <mesh
                ref={meshRef}
                position={box.position}
                rotation={box.rotation}
                scale={box.scale}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    visible={true}
                    wireframe={false}
                />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
                    <lineBasicMaterial color={isSelected ? '#fff' : color} linewidth={2} />
                </lineSegments>

                {/* Floating Label Text */}
                <Html position={[0, 0.6, 0]} center>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-lg pointer-events-none transition-all ${isSelected ? 'bg-primary scale-110 z-10' : 'bg-black/50 backdrop-blur-sm'
                        }`}>
                        {box.label}
                    </div>
                </Html>
            </mesh>

            {/* Transform Mode Controls UI (Only visible when selected) */}
            {isSelected && !readOnly && (
                <Html position={[0, -0.8, 0]} center>
                    <div className="flex bg-black/80 rounded-lg p-1 gap-1 border border-white/20 backdrop-blur shadow-xl pointer-events-auto">
                        <button onClick={() => setMode('translate')} className={`p-1.5 rounded hover:bg-white/20 ${mode === 'translate' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                            <Move size={14} />
                        </button>
                        <button onClick={() => setMode('rotate')} className={`p-1.5 rounded hover:bg-white/20 ${mode === 'rotate' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                            <RotateCw size={14} />
                        </button>
                        <button onClick={() => setMode('scale')} className={`p-1.5 rounded hover:bg-white/20 ${mode === 'scale' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                            <Maximize size={14} />
                        </button>
                    </div>
                </Html>
            )}
        </>
    );
}

// --- Main Component ---

export function ThreeDLabeler({ src, component, value = [], onChange, readOnly }: ThreeDLabelerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeLabelIdx, setActiveLabelIdx] = useState(0);

    const labels = component.labels || [{ value: 'Object', background: '#FF0000' }];
    const activeLabel = labels[activeLabelIdx] || labels[0];

    // Ensure value is an array
    const boxes = Array.isArray(value) ? value : [];

    const addBox = () => {
        if (readOnly) return;
        const newBox: Box3D = {
            id: nanoid(),
            label: activeLabel.value,
            color: activeLabel.background || '#ffffff',
            position: [0, 0, 0],   // Center
            rotation: [0, 0, 0],
            scale: [2, 2, 2],      // Default size
        };
        onChange([...boxes, newBox]);
        setSelectedId(newBox.id);
    };

    const updateBox = (id: string, updates: Partial<Box3D>) => {
        if (readOnly) return;
        onChange(boxes.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBox = (id: string | null = selectedId) => {
        if (!id || readOnly) return;
        onChange(boxes.filter(b => b.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            deleteBox();
        }
    };

    return (
        <div
            className="flex flex-col h-[600px] border border-white/10 rounded-xl overflow-hidden bg-zinc-950 relative group"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Toolbar Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-xl space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground px-1 mb-1">Tools</p>
                    <button
                        onClick={addBox}
                        className="w-full p-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded flex items-center justify-center gap-2 transition-all"
                        title="Add 3D Bounding Box"
                        disabled={readOnly}
                    >
                        <Box size={16} />
                        <span className="text-xs font-bold">Add Box</span>
                    </button>
                    <button
                        onClick={() => deleteBox()}
                        disabled={!selectedId || readOnly}
                        className="w-full p-2 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                        title="Delete Selected"
                    >
                        <Trash2 size={16} />
                        <span className="text-xs">Delete</span>
                    </button>
                </div>

                <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-xl space-y-2 max-w-[200px]">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Labels</p>
                        <Layers size={12} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {labels.map((lbl, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setActiveLabelIdx(i);
                                    if (selectedId) {
                                        updateBox(selectedId, { label: lbl.value, color: lbl.background });
                                    }
                                }}
                                className={`flex items-center gap-2 p-2 rounded text-left transition-all ${activeLabelIdx === i ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lbl.background || '#ccc' }} />
                                <span className={`text-xs ${activeLabelIdx === i ? 'text-white font-bold' : 'text-muted-foreground'}`}>
                                    {lbl.value}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
                {/* Scene Setup */}
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Grid infiniteGrid fadeDistance={50} sectionColor="#444" cellColor="#222" />

                {/* Point Cloud Data */}
                <PointCloud />

                {/* Drawn Boxes */}
                {boxes.map((box) => (
                    <LabelableBox
                        key={box.id}
                        box={box}
                        isSelected={selectedId === box.id}
                        onSelect={() => setSelectedId(box.id)}
                        onChange={updateBox}
                        readOnly={readOnly}
                        activeLabel={activeLabel}
                    />
                ))}

                {/* Controls */}
                <OrbitControls makeDefault />

                {/* UI Helpers */}
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
                </GizmoHelper>
            </Canvas>

            {/* Stats Overlay */}
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono bg-black/50 px-2 py-1 rounded">
                {boxes.length} objects | Selected: {selectedId ? boxes.find(b => b.id === selectedId)?.label : 'None'}
            </div>
        </div>
    );
}
