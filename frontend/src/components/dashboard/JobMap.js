import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const JobMap = ({ data, title, loading }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // Import leaflet dynamically to avoid SSR issues
    const initializeMap = async () => {
      const L = await import('leaflet');
      const markerCluster = await import('leaflet.markercluster');
      await import('leaflet.markercluster/dist/MarkerCluster.css');
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
      
      if (!mapRef.current || mapInitialized) return;
      
      // Initialize the map if it doesn't exist
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([15.87, 100.99], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMap.current);
        
        // Initialize marker cluster
        markersLayer.current = L.markerClusterGroup();
        leafletMap.current.addLayer(markersLayer.current);
        
        setMapInitialized(true);
      }
    };
    
    initializeMap();
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersLayer.current = null;
        setMapInitialized(false);
      }
    };
  }, []);
  
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInitialized || !markersLayer.current || !data || loading) return;
      
      const L = await import('leaflet');
      
      // Clear existing markers
      markersLayer.current.clearLayers();
      
      // Status colors for markers
      const statusColors = {
        'WAITINGJOB': '#FFA500',
        'WORKING': '#1E90FF',
        'PENDING': '#FFD700',
        'COMPLETED': '#32CD32',
        'CLOSED': '#006400',
        'CANCELLED': '#DC143C',
        'REVIEW': '#9932CC'
      };
      
      // Add new markers
      data.forEach(job => {
        if (!job.location || !job.location.coordinates) return;
        
        const [lon, lat] = job.location.coordinates;
        if (!lat || !lon) return;
        
        const color = statusColors[job.status] || '#3388ff';
        
        const markerHtmlStyles = `
          background-color: ${color};
          width: 2rem;
          height: 2rem;
          display: block;
          left: -1rem;
          top: -1rem;
          position: relative;
          border-radius: 2rem 2rem 0;
          transform: rotate(45deg);
          border: 1px solid #FFFFFF;
        `;
        
        const icon = L.divIcon({
          className: "custom-pin",
          iconAnchor: [0, 24],
          labelAnchor: [-6, 0],
          popupAnchor: [0, -36],
          html: `<span style="${markerHtmlStyles}" />`
        });
        
        const popupContent = `
          <div style="font-family: Arial; width: 200px;">
            <b>Job No:</b> ${job.jobNo || 'N/A'}<br>
            <b>Status:</b> ${job.status || 'N/A'}<br>
            <b>Type:</b> ${job.type || 'N/A'}<br>
            <b>Location:</b> ${job.location.name || 'N/A'}<br>
            <b>Customer:</b> ${job.customerName || 'N/A'}<br>
            <b>Technician:</b> ${job.technicianNames || 'N/A'}<br>
            <b>Created:</b> ${job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}
          </div>
        `;
        
        const marker = L.marker([lat, lon], { icon }).bindPopup(popupContent);
        markersLayer.current.addLayer(marker);
      });
      
      // Fit bounds if we have markers
      if (markersLayer.current.getLayers().length > 0) {
        leafletMap.current.fitBounds(markersLayer.current.getBounds(), { padding: [50, 50] });
      }
    };
    
    updateMarkers();
  }, [data, mapInitialized, loading]);
  
  return (
    <Card sx={{ height: '100%', minHeight: 500 }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="calc(100% - 30px)">
            <CircularProgress />
          </Box>
        ) : (
          <Box 
            ref={mapRef} 
            sx={{ 
              height: 'calc(100% - 30px)', 
              width: '100%', 
              minHeight: 450,
              bgcolor: '#f0f0f0',
              borderRadius: 1 
            }} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default JobMap;