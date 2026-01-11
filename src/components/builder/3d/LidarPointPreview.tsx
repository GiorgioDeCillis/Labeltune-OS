'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface LidarPointPreviewProps {
    pointCount?: number;
    color?: string;
}

export function LidarPointPreview({ pointCount = 5000, color = '#ff0055' }: LidarPointPreviewProps) {
    const points = useMemo(() => {
        const p = new Float32Array(pointCount * 3);
        const colors = new Float32Array(pointCount * 3);
        const colorObj = new THREE.Color(color);

        for (let i = 0; i < pointCount; i++) {
            // Generate points in a spiral/cylindrical shape to simulate lidar scan
            const r = 10 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 10;

            p[i * 3] = r * Math.cos(theta);
            p[i * 3 + 1] = y;
            p[i * 3 + 2] = r * Math.sin(theta);

            // Add some noise/random points closer to center
            if (i % 10 === 0) {
                p[i * 3] = (Math.random() - 0.5) * 50;
                p[i * 3 + 1] = (Math.random() - 0.5) * 10;
                p[i * 3 + 2] = (Math.random() - 0.5) * 50;
            }

            colors[i * 3] = colorObj.r + (Math.random() - 0.5) * 0.2;
            colors[i * 3 + 1] = colorObj.g + (Math.random() - 0.5) * 0.2;
            colors[i * 3 + 2] = colorObj.b + (Math.random() - 0.5) * 0.2;
        }
        return { positions: p, colors: colors };
    }, [pointCount, color]);

    return (
        <div className="w-full h-[400px] bg-black rounded-lg border border-white/10 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-mono text-white/70">
                LIDAR Preview • {pointCount.toLocaleString()} points
            </div>
            <Canvas>
                <PerspectiveCamera makeDefault position={[30, 20, 30]} />
                <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
                <gridHelper args={[100, 100, 0x333333, 0x111111]} />
                <points>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={points.positions.length / 3}
                            array={points.positions}
                            itemSize={3}
                        />
                        <bufferAttribute
                            attach="attributes-color"
                            count={points.colors.length / 3}
                            array={points.colors}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.15}
                        vertexColors
                        sizeAttenuation={true}
                        transparent
                        opacity={0.8}
                    />
                </points>
            </Canvas>
        </div>
    );
}
