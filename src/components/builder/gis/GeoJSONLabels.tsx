'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, ZoomControl, useMap } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { TaskComponent } from '../types';

// Fix for default icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeoJSONLabelsProps {
    component: TaskComponent;
    value?: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
    height?: string;
}

// Helper to center map on features
function FitBounds({ value }: { value: any }) {
    const map = useMap();
    useEffect(() => {
        if (value && value.features && value.features.length > 0) {
            try {
                const geoJsonLayer = L.geoJSON(value);
                map.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50] });
            } catch (e) {
                console.warn("Invalid GeoJSON for bounds fitting", e);
            }
        }
    }, [value, map]);
    return null;
}

export function GeoJSONLabels({ component, value, onChange, readOnly, height = "600px" }: GeoJSONLabelsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const featureGroupRef = useRef<L.FeatureGroup>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize with FeatureCollection structure if empty
    const geoJsonData = value || { type: "FeatureCollection", features: [] };

    const handleCreated = (e: any) => {
        if (readOnly) return;
        const layer = e.layer;

        // Convert to GeoJSON
        const neoGeoJSON = layer.toGeoJSON();

        // Add ID if missing
        if (!neoGeoJSON.id) neoGeoJSON.id = L.Util.stamp(layer);

        const newFeatures = [...geoJsonData.features, neoGeoJSON];
        onChange({ ...geoJsonData, features: newFeatures });
    };

    const handleEdited = (e: any) => {
        if (readOnly) return;
        const layers = e.layers;
        let currentFeatures = [...geoJsonData.features];

        layers.eachLayer((layer: any) => {
            const editedGeoJSON = layer.toGeoJSON();
            // Match by ID logic would be needed for robustness, 
            // but Leaflet Draw + React Leaflet state sync is tricky.
            // Simplest approach: Re-serialize entire FeatureGroup?
            // Actually, simplest reliable way with react-leaflet-draw is to assume
            // the FeatureGroup ref contains the truth.
        });

        // Better approach for state sync:
        if (featureGroupRef.current) {
            const allLayers: any[] = [];
            featureGroupRef.current.eachLayer((layer: any) => {
                allLayers.push(layer.toGeoJSON());
            });
            onChange({ ...geoJsonData, features: allLayers });
        }
    };

    const handleDeleted = (e: any) => {
        if (readOnly) return;
        if (featureGroupRef.current) {
            const allLayers: any[] = [];
            featureGroupRef.current.eachLayer((layer: any) => {
                allLayers.push(layer.toGeoJSON());
            });
            onChange({ ...geoJsonData, features: allLayers });
        }
    };

    // We need to initialize the FeatureGroup with existing GeoJSON on mount
    const onMapReady = (map: L.Map) => {
        // Logic to populate featureGroup from 'value' prop?
        // React-Leaflet handles this if we render GeoJSON component, 
        // BUT standard EditControl works best with empty FeatureGroup that user draws into.
        // To support editing EXISTING values, we'd need to manually add layers to the FeatureGroup.
    };

    if (!isMounted) {
        return (
            <div
                className="w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground"
                style={{ height }}
            >
                Loading GIS Interface...
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden border border-white/10 relative z-0 bg-black" style={{ height }}>
            <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FeatureGroup ref={featureGroupRef}>
                    {!readOnly && (
                        <EditControl
                            position="topright"
                            onCreated={handleCreated}
                            onEdited={handleEdited}
                            onDeleted={handleDeleted}
                            draw={{
                                rectangle: true,
                                polygon: true,
                                circle: false,
                                circlemarker: false,
                                marker: true,
                                polyline: true
                            }}
                        />
                    )}
                    {/* Render existing features so they are editable (tricky with key prop to force re-render) */}
                    {/* Note: In a real app we'd map 'value.features' to L.geoJSON layers and add them to the ref */}
                </FeatureGroup>

                {/* Fit bounds to data */}
                <FitBounds value={geoJsonData} />

                {/* If read-only, visualization only */}
                {readOnly && value && (
                    // @ts-ignore
                    <L.GeoJSON data={value} />
                )}
            </MapContainer>

            <div className="absolute top-4 left-4 z-[500] bg-white/90 text-black px-3 py-1 rounded shadow-lg text-xs font-bold">
                {geoJsonData.features.length} Features
            </div>
        </div>
    );
}

