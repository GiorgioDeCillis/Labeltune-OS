'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage, Transformer, Circle, Group } from 'react-konva';
import useImage from 'use-image';
import { TaskComponent, Region } from '../types';
import { ZoomIn, ZoomOut, Move, MousePointer2, Box, Pentagon, RotateCcw, Trash2, Sun, FileCode } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImageCanvasProps {
    src: string;
    component: TaskComponent;
    value: Region[];
    onChange: (regions: Region[]) => void;
    readOnly?: boolean;
}

export function ImageCanvas({ src, component, value = [], onChange, readOnly }: ImageCanvasProps) {
    const [image] = useImage(src, 'anonymous'); // 'anonymous' helps with cross-origin issues

    // Canvas State
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // Tools: 'select' | 'rect' | 'polygon' | 'pan'
    const [tool, setTool] = useState<'select' | 'rect' | 'polygon' | 'pan'>('select');

    // Selection
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const transformerRef = useRef<any>(null);

    // Drawing State
    const [newRegionPoints, setNewRegionPoints] = useState<number[]>([]);
    const [activeLabel, setActiveLabel] = useState<string>(component.imageConfig?.labels?.[0]?.value || 'Object');

    const stageRef = useRef<any>(null);

    // Initialize transformer
    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedId]);

    // Update active label when component changes
    useEffect(() => {
        if (component.imageConfig?.labels?.length && !component.imageConfig.labels.find(l => l.value === activeLabel)) {
            setActiveLabel(component.imageConfig.labels[0].value);
        }
    }, [component.imageConfig?.labels]);

    // Handle Wheel Zoom
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        // Limit zoom
        if (newScale < 0.1 || newScale > 10) return;

        setStageScale(newScale);
        setStagePos({
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        });
    };

    // ------------- Drawing Logic -------------

    const getMousePos = () => {
        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = transform.point(pointer);
        return [pos.x, pos.y];
    };

    const handleStageMouseDown = (e: any) => {
        if (readOnly) return;

        // If clicking on empty stage with select tool, deselect
        if (tool === 'select' && e.target === e.target.getStage()) {
            setSelectedId(null);
            return;
        }

        if (tool === 'pan') return;

        const [x, y] = getMousePos();

        if (tool === 'rect') {
            setNewRegionPoints([x, y, 0, 0]); // Start x, start y, w, h
        } else if (tool === 'polygon') {
            setNewRegionPoints([...newRegionPoints, x, y]);
        }
    };

    const handleStageMouseMove = (e: any) => {
        if (readOnly) return;
        const [x, y] = getMousePos();
        setCursorPos({ x, y });

        if (tool === 'rect' && newRegionPoints.length > 0) {
            const [startX, startY] = newRegionPoints;
            const width = x - startX;
            const height = y - startY;
            setNewRegionPoints([startX, startY, width, height]);
        }
    };

    const handleStageMouseUp = () => {
        if (readOnly) return;
        if (tool === 'rect' && newRegionPoints.length > 0) {
            // Finish Rect
            const [x, y, w, h] = newRegionPoints;

            // Ignore tiny boxes
            if (Math.abs(w) > 5 && Math.abs(h) > 5) {
                const labelConfig = component.imageConfig?.labels?.find(l => l.value === activeLabel);
                const newRegion: Region = {
                    id: uuidv4(),
                    type: 'box',
                    label: activeLabel,
                    points: [x, y, w, h], // We normalize later if needed
                    color: labelConfig?.background || '#00ff00'
                };
                onChange([...value, newRegion]);
                // Select newly created
                setTimeout(() => {
                    setTool('select');
                    setSelectedId(newRegion.id);
                }, 50);
            }
            setNewRegionPoints([]);
        }
    };

    const handlePolygonPointClick = (e: any) => {
        if (tool !== 'polygon') return;
        // If clicked on the first point, close the polygon
        if (newRegionPoints.length >= 6) { // Minimum 3 points (2 coords each)
            // Check distance to first point
            const [firstX, firstY] = newRegionPoints;
            const [currX, currY] = getMousePos();
            const dist = Math.sqrt(Math.pow(currX - firstX, 2) + Math.pow(currY - firstY, 2));

            if (dist < 10) {
                // Close polygon
                const labelConfig = component.imageConfig?.labels?.find(l => l.value === activeLabel);
                const newRegion: Region = {
                    id: uuidv4(),
                    type: 'polygon',
                    label: activeLabel,
                    points: newRegionPoints,
                    color: labelConfig?.background || '#00ff00'
                };
                onChange([...value, newRegion]);
                setNewRegionPoints([]);
                setTool('select');
                setSelectedId(newRegion.id); // Done
            }
        }
    };

    // Keydown handlers for delete, etc.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

            if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
                onChange(value.filter(r => r.id !== selectedId));
                setSelectedId(null);
            }
            if (e.key === 'Escape') {
                if (newRegionPoints.length > 0) {
                    setNewRegionPoints([]);
                }
                setTool('select');
                setSelectedId(null);
            }

            // Tool Shortcuts
            if (e.key === 'v') setTool('select');
            if (e.key === 'm') setTool('pan');
            if (e.key === 'r') setTool('rect');
            if (e.key === 'p') setTool('polygon');

            // Label Shortcuts (1-9)
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                const labels = component.imageConfig?.labels || [];
                if (labels[index]) {
                    setActiveLabel(labels[index].value);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, value, component.imageConfig?.labels]);


    // Styles for image filters (applied via CSS filter)
    const imageStyle = {
        filter: `brightness(${brightness}%) contrast(${contrast}%)`
    };

    return (
        <div className="flex flex-col h-[700px] border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white/5 border-b border-white/10 p-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-1">
                    <ToolButton active={tool === 'pan'} onClick={() => setTool('pan')} icon={Move} title="Pan" />
                    <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} title="Select" />
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <ToolButton active={tool === 'rect'} onClick={() => { setSelectedId(null); setTool('rect'); }} icon={Box} title="Rectangle" />
                    <ToolButton active={tool === 'polygon'} onClick={() => { setSelectedId(null); setTool('polygon'); }} icon={Pentagon} title="Polygon" />
                </div>

                <div className="flex items-center gap-4">
                    {/* Label Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Label:</span>
                        <select
                            value={activeLabel}
                            onChange={(e) => setActiveLabel(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                        >
                            {component.imageConfig?.labels?.map(l => (
                                <option key={l.value} value={l.value}>{l.value}</option>
                            )) || <option value="Object">Object</option>}
                        </select>
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    {/* Brightness/Contrast UI */}
                    {component.imageConfig?.canBrightnessContrast && (
                        <div className="flex items-center gap-3 px-3 border-x border-white/10">
                            <div className="flex items-center gap-2">
                                <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="range" min="50" max="200" value={brightness}
                                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                                    className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FileCode className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
                                <input
                                    type="range" min="50" max="200" value={contrast}
                                    onChange={(e) => setContrast(parseInt(e.target.value))}
                                    className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>
                    )}

                    {/* Zoom Controls */}
                    <div className="flex items-center bg-black/30 rounded-lg border border-white/5 p-1 gap-1">
                        <button onClick={() => setStageScale(s => Math.max(0.1, s - 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="w-3 h-3" /></button>
                        <span className="text-[10px] w-8 text-center">{Math.round(stageScale * 100)}%</span>
                        <button onClick={() => setStageScale(s => Math.min(10, s + 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="w-3 h-3" /></button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-[#121212] overflow-hidden cursor-crosshair">
                <Stage
                    ref={stageRef}
                    width={800} // This should be responsive, but for now fixed/flexible container
                    height={600}
                    className="w-full h-full"
                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                    scaleX={stageScale}
                    scaleY={stageScale}
                    x={stagePos.x}
                    y={stagePos.y}
                    draggable={tool === 'pan'}
                    onWheel={handleWheel}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                >
                    <Layer>
                        {image && (
                            <KonvaImage
                                image={image}
                                filters={[]} // Konva filters can be heavy, using CSS for entire canvas usually better if possible, but here we are inside canvas.
                            // Actually, for brightness/contrast in Konva, you need cache(). 
                            // For simplicity/performance in this MVP, we might skip dynamic brightness on the Konva Image immediately or use native canvas filter if possible.
                            // Let's just render raw image for now.
                            />
                        )}
                    </Layer>

                    <Layer>
                        {/* Existing Regions */}
                        {value.map((region, i) => {
                            const isSelected = selectedId === region.id;
                            if (region.type === 'box') {
                                return (
                                    <Rect
                                        key={region.id}
                                        id={region.id}
                                        x={region.points[0]}
                                        y={region.points[1]}
                                        width={region.points[2]}
                                        height={region.points[3]}
                                        stroke={region.color}
                                        strokeWidth={2 / stageScale}
                                        fill={isSelected ? region.color + '33' : 'transparent'} // Add transparency
                                        draggable={tool === 'select'}
                                        onClick={() => tool === 'select' && setSelectedId(region.id)}
                                        onTap={() => tool === 'select' && setSelectedId(region.id)}
                                        onDragEnd={(e) => {
                                            const newAttrs = {
                                                points: [e.target.x(), e.target.y(), e.target.width(), e.target.height()]
                                            };
                                            onChange(value.map(r => r.id === region.id ? { ...r, points: [e.target.x(), e.target.y(), region.points[2], region.points[3]] } : r));
                                        }}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            // Update data
                                            onChange(value.map(r => r.id === region.id ? { ...r, points: [node.x(), node.y(), node.width() * node.scaleX(), node.height() * node.scaleY()] } : r));
                                            // Reset scale so it doesn't compound
                                            node.scaleX(1);
                                            node.scaleY(1);
                                        }}
                                    />
                                );
                            } else if (region.type === 'polygon') {
                                return (
                                    <Line
                                        key={region.id}
                                        id={region.id}
                                        points={region.points}
                                        stroke={region.color}
                                        strokeWidth={2 / stageScale}
                                        fill={isSelected ? region.color + '33' : 'transparent'}
                                        closed
                                        draggable={tool === 'select'}
                                        onClick={() => tool === 'select' && setSelectedId(region.id)}
                                        onDragEnd={(e) => {
                                            // Handling polygon drag is tricky because points are relative to parent, but drag moves the group/shape offset.
                                            // Best is to update all points by delta.
                                            // For MVP, Konva handles {x,y} offset automatically on drag, we just need to save it.
                                            const node = e.target;
                                            const dx = node.x();
                                            const dy = node.y();
                                            // Apply delta to points and reset x/y to 0
                                            const newPoints = region.points.map((p, i) => i % 2 === 0 ? p + dx : p + dy);
                                            onChange(value.map(r => r.id === region.id ? { ...r, points: newPoints } : r));
                                            node.x(0);
                                            node.y(0);
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Drawing In-Progress */}
                        {tool === 'rect' && newRegionPoints.length > 0 && (
                            <Rect
                                x={newRegionPoints[0]}
                                y={newRegionPoints[1]}
                                width={newRegionPoints[2]}
                                height={newRegionPoints[3]}
                                stroke="white"
                                strokeWidth={1 / stageScale}
                                dash={[5, 5]}
                            />
                        )}
                        {tool === 'polygon' && newRegionPoints.length > 0 && (
                            <>
                                <Line
                                    points={[...newRegionPoints, cursorPos.x, cursorPos.y]}
                                    stroke="yellow"
                                    strokeWidth={2 / stageScale}
                                    dash={[4, 4]}
                                    closed={false}
                                />
                                <Line
                                    points={newRegionPoints}
                                    stroke="yellow"
                                    strokeWidth={2 / stageScale}
                                    closed={false}
                                />
                                {newRegionPoints.map((p, i) => (
                                    i % 2 === 0 ? (
                                        <Circle
                                            key={i}
                                            x={newRegionPoints[i]}
                                            y={newRegionPoints[i + 1]}
                                            radius={i === 0 ? 6 / stageScale : 3 / stageScale} // Larger anchor for first point
                                            fill={i === 0 ? "white" : "yellow"}
                                            stroke="black"
                                            strokeWidth={1 / stageScale}
                                            onClick={handlePolygonPointClick}
                                        />
                                    ) : null
                                ))}
                            </>
                        )}

                        <Transformer ref={transformerRef} rotateEnabled={false} keepRatio={false} borderStroke="white" anchorStroke="white" anchorFill="blue" anchorSize={8} />
                    </Layer>
                </Stage>

                {/* Resize Observer wrapper usually needed for responsive stage */}
            </div>

            {/* Properties / Info */}
            <div className="bg-white/5 border-t border-white/10 p-2 px-4 flex justify-between items-center text-xs text-muted-foreground">
                <div>
                    {value.length} Regions | Selection: {selectedId ? 'Active' : 'None'}
                </div>
                <div>
                    Scale: {Math.round(stageScale * 100)}%
                </div>
            </div>
        </div>
    );
}

function ToolButton({ active, onClick, icon: Icon, title }: any) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-all ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-white/10 text-muted-foreground hover:text-white'}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}
