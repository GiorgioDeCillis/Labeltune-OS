'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TaskComponent } from '../types';

// Fix for default marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapCanvasProps {
    component: TaskComponent;
    value?: any;
    readOnly?: boolean;
    height?: string;
}

export function MapCanvas({ component, value, readOnly, height = "500px" }: MapCanvasProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Default center (London) if not provided
    const defaultCenter: [number, number] = [51.505, -0.09];
    const initialZoom = 13;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div
                className="w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground"
                style={{ height }}
            >
                Loading Map...
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden border border-white/10 relative z-0" style={{ height }}>
            <MapContainer
                center={defaultCenter}
                zoom={initialZoom}
                scrollWheelZoom={!readOnly}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite (Esri)">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Dark Matter (CartoDB)">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>
            </MapContainer>

            {/* Overlay for attribution */}
            <div className="absolute bottom-1 left-2 text-[10px] text-black/60 bg-white/40 px-1 rounded pointer-events-none z-[400]">
                Labeltune GIS
            </div>
        </div>
    );
}
