'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';

interface MapProps {
  issues?: any[];
  height?: string;
  onIssueClick?: (issue: any) => void;
}

export function SimpleMap({ 
  issues = [], 
  height = '100%',
  onIssueClick 
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize map only once
    if (!mapRef.current && !mapInitialized.current) {
      mapInitialized.current = true;
      mapRef.current = L.map('simple-map', {
        center: [23.6102, 85.2799], // Center of Jharkhand
        zoom: 8,
        minZoom: 7,
        maxZoom: 18,
        maxBounds: [
          [21.9, 83.3], // Southwest corner of Jharkhand
          [25.3, 87.9]  // Northeast corner of Jharkhand
        ],
        maxBoundsViscosity: 1.0
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Demo issues across Jharkhand (fallback if no real data)
    const demoIssues = [
      {
        id: '1',
        title: 'Major pothole causing accidents',
        category: 'Road',
        priority: 'critical',
        status: 'pending',
        lat: 23.3569,
        lng: 85.3342,
        address: 'Kanke Road, Ranchi',
      },
      {
        id: '2',
        title: 'Water pipe burst',
        category: 'Water',
        priority: 'high',
        status: 'in_progress',
        lat: 23.3551,
        lng: 85.3240,
        address: 'Upper Bazaar, Ranchi',
      },
      {
        id: '3',
        title: 'Traffic signal malfunction',
        category: 'Traffic',
        priority: 'high',
        status: 'pending',
        lat: 23.3608,
        lng: 85.3330,
        address: 'Firayalal Chowk, Ranchi',
      },
      {
        id: '4',
        title: 'Street light issue',
        category: 'Lighting',
        priority: 'medium',
        status: 'pending',
        lat: 22.8046,
        lng: 86.2029,
        address: 'Sakchi, Jamshedpur',
      },
      {
        id: '5',
        title: 'Drainage blockage',
        category: 'Drainage',
        priority: 'high',
        status: 'in_progress',
        lat: 23.6693,
        lng: 86.1511,
        address: 'Station Road, Dhanbad',
      },
      {
        id: '6',
        title: 'Road construction delay',
        category: 'Road',
        priority: 'medium',
        status: 'pending',
        lat: 23.7957,
        lng: 86.4304,
        address: 'GT Road, Bokaro',
      },
      {
        id: '7',
        title: 'Garbage collection issue',
        category: 'Sanitation',
        priority: 'low',
        status: 'resolved',
        lat: 24.4798,
        lng: 85.5556,
        address: 'Civil Lines, Hazaribagh',
      },
      {
        id: '8',
        title: 'Water shortage',
        category: 'Water',
        priority: 'critical',
        status: 'pending',
        lat: 24.0134,
        lng: 85.0359,
        address: 'Main Market, Ramgarh',
      },
    ];

    // Use real issues if available, otherwise use demo
    const displayIssues = issues.length > 0 ?
      issues.map(issue => ({
        ...issue,
        lat: issue.location?.lat || issue.lat || issue.latitude || 0,
        lng: issue.location?.lng || issue.lng || issue.longitude || 0,
        address: issue.address || issue.location || 'Unknown location',
      })).filter(issue => issue.lat && issue.lng) : demoIssues;

    // Add markers
    displayIssues.forEach((issue) => {
      const colors = {
        critical: '#DC2626',
        high: '#EA580C',
        medium: '#F59E0B',
        low: '#10B981'
      };
      
      const color = colors[issue.priority as keyof typeof colors] || '#6B7280';
      
      // Create custom location pin icon
      const icon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#shadow-${issue.id})">
              <path d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 24 14 24s14-16.268 14-24C28 6.268 21.732 0 14 0z" 
                    fill="${color}" stroke="white" stroke-width="1.5"/>
              <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
              <circle cx="14" cy="14" r="4" fill="${color}"/>
            </g>
            <defs>
              <filter id="shadow-${issue.id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.25"/>
              </filter>
            </defs>
          </svg>
        `,
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -38]
      });
      
      // Create marker with custom icon
      const marker = L.marker([issue.lat, issue.lng], { icon }).addTo(mapRef.current!);

      // Add popup
      marker.bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #1a1a1a;">
            ${issue.title}
          </h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
            📍 ${issue.address}
          </p>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
            Category: ${issue.category}
          </p>
          <div style="display: flex; gap: 8px;">
            <span style="
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 12px;
              background-color: ${color}20;
              color: ${color};
              font-weight: 600;
            ">
              ${issue.priority.toUpperCase()}
            </span>
            <span style="
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 12px;
              background-color: #E5E7EB;
              color: #6B7280;
              font-weight: 600;
            ">
              ${issue.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onIssueClick) onIssueClick(issue);
      });

      markersRef.current.push(marker as any);
    });

  }, [issues]); // Re-run when issues change

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <div id="simple-map" style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden' }} />
      
      {/* Map Title Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a' }}>
          Jharkhand Civic Issues
        </div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
          8 active issues across the state
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '11px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#1a1a1a' }}>Priority</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#DC2626', borderRadius: '50%' }}></div>
            <span>Critical</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#EA580C', borderRadius: '50%' }}></div>
            <span>High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div>
            <span>Medium</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}