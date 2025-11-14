'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface MapProps {
  issues?: any[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onIssueClick?: (issue: any) => void;
}

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export function Map({ 
  issues = [], 
  center = [23.6102, 85.2799], // Center of Jharkhand
  zoom = 8, // Zoom level to show entire Jharkhand
  height = '100%',
  onIssueClick 
}: MapProps) {
  
  // Demo issues across Jharkhand if no issues provided
  const demoIssues = [
    {
      id: '1',
      title: 'Major pothole causing accidents',
      category: 'Road',
      priority: 'critical',
      status: 'pending',
      location: { lat: 23.3569, lng: 85.3342 },
      address: 'Kanke Road, Ranchi',
    },
    {
      id: '2',
      title: 'Water pipe burst',
      category: 'Water',
      priority: 'high',
      status: 'in_progress',
      location: { lat: 23.3551, lng: 85.3240 },
      address: 'Upper Bazaar, Ranchi',
    },
    {
      id: '3',
      title: 'Traffic signal malfunction',
      category: 'Traffic',
      priority: 'high',
      status: 'pending',
      location: { lat: 23.3608, lng: 85.3330 },
      address: 'Firayalal Chowk, Ranchi',
    },
    {
      id: '4',
      title: 'Street light issue',
      category: 'Lighting',
      priority: 'medium',
      status: 'pending',
      location: { lat: 22.8046, lng: 86.2029 },
      address: 'Sakchi, Jamshedpur',
    },
    {
      id: '5',
      title: 'Drainage blockage',
      category: 'Drainage',
      priority: 'high',
      status: 'in_progress',
      location: { lat: 23.6693, lng: 86.1511 },
      address: 'Station Road, Dhanbad',
    },
    {
      id: '6',
      title: 'Road construction delay',
      category: 'Road',
      priority: 'medium',
      status: 'pending',
      location: { lat: 23.7957, lng: 86.4304 },
      address: 'GT Road, Bokaro',
    },
    {
      id: '7',
      title: 'Garbage collection issue',
      category: 'Sanitation',
      priority: 'low',
      status: 'resolved',
      location: { lat: 24.4798, lng: 85.5556 },
      address: 'Civil Lines, Hazaribagh',
    },
    {
      id: '8',
      title: 'Water shortage',
      category: 'Water',
      priority: 'critical',
      status: 'pending',
      location: { lat: 24.0134, lng: 85.0359 },
      address: 'Main Market, Ramgarh',
    },
  ];

  const displayIssues = issues.length > 0 ? issues : demoIssues;

  // Create custom marker based on priority
  const getMarkerHtml = (priority: string) => {
    const colors = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#F59E0B',
      low: '#10B981'
    };
    const color = colors[priority as keyof typeof colors] || '#6B7280';
    
    return `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
        <circle cx="15" cy="15" r="4" fill="${color}"/>
      </svg>
    `;
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        minZoom={7}
        maxZoom={18}
        maxBounds={[
          [21.9, 83.3], // Southwest corner of Jharkhand
          [25.3, 87.9]  // Northeast corner of Jharkhand
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {displayIssues.map((issue) => {
          if (!issue.location?.lat || !issue.location?.lng) return null;
          
          const icon = L.divIcon({
            html: getMarkerHtml(issue.priority || 'medium'),
            className: 'custom-div-icon',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -35]
          });
          
          return (
            <Marker
              key={issue.id}
              position={[issue.location.lat, issue.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onIssueClick?.(issue)
              }}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    marginBottom: '8px',
                    color: '#1a1a1a' 
                  }}>
                    {issue.title}
                  </h3>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginBottom: '4px' 
                  }}>
                    📍 {issue.address || 'Unknown location'}
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginBottom: '8px' 
                  }}>
                    Category: {issue.category}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: issue.priority === 'critical' ? '#FEE2E2' :
                                     issue.priority === 'high' ? '#FED7AA' :
                                     issue.priority === 'medium' ? '#FEF3C7' : '#D1FAE5',
                      color: issue.priority === 'critical' ? '#DC2626' :
                             issue.priority === 'high' ? '#EA580C' :
                             issue.priority === 'medium' ? '#F59E0B' : '#10B981',
                      fontWeight: '600'
                    }}>
                      {issue.priority?.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: issue.status === 'resolved' ? '#D1FAE5' :
                                     issue.status === 'in_progress' ? '#DBEAFE' : '#E5E7EB',
                      color: issue.status === 'resolved' ? '#10B981' :
                             issue.status === 'in_progress' ? '#3B82F6' : '#6B7280',
                      fontWeight: '600'
                    }}>
                      {issue.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
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
          {displayIssues.length} active issues
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