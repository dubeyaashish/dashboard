// File: frontend/src/components/dashboard/JobMap.js (FIXED VERSION)
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, alpha, useTheme } from '@mui/material';

const JobMap = ({ data, title, loading }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const theme = useTheme();

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Check if Leaflet is already loaded
        if (window.L) {
          setLeafletLoaded(true);
          return;
        }

        // Dynamically import Leaflet
        const L = await import('leaflet');
        
        // Import marker cluster
        await import('leaflet.markercluster');
        
        // Set default icon paths (IMPORTANT FIX)
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Make L available globally
        window.L = L;
        setLeafletLoaded(true);
        console.log("Leaflet loaded successfully");
      } catch (error) {
        console.error("Error loading Leaflet:", error);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInitialized) return;

    const initializeMap = async () => {
      try {
        const L = window.L;
        
        // Initialize the map
        leafletMap.current = L.map(mapRef.current, {
          center: [13.7563, 100.5018], // Bangkok coordinates
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(leafletMap.current);
        
        // Initialize marker cluster
        markersLayer.current = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: false,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50
        });
        
        leafletMap.current.addLayer(markersLayer.current);
        
        console.log("Map initialized successfully");
        setMapInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };
    
    initializeMap();
    
    // Cleanup function
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersLayer.current = null;
        setMapInitialized(false);
      }
    };
  }, [leafletLoaded, mapInitialized]);
  
  // Update markers when data changes
  useEffect(() => {
    if (!mapInitialized || !markersLayer.current || !data || loading || !window.L) return;
    
    const updateMarkers = () => {
      try {
        const L = window.L;
        
        // Clear existing markers
        markersLayer.current.clearLayers();
        
        // Status colors for markers
        const statusColors = {
          'WAITINGJOB': '#FFA500', // orange
          'WORKING': '#1E90FF',    // blue  
          'PENDING': '#FFD700',    // yellow
          'COMPLETED': '#32CD32',  // green
          'CLOSED': '#006400',     // dark green
          'CANCELLED': '#DC143C',  // crimson
          'REVIEW': '#9932CC'      // purple
        };
        
        console.log(`Processing ${data.length} jobs for map markers`);
        
        let validMarkers = 0;
        const bounds = L.latLngBounds();
        
        // Add markers for each job
        data.forEach((job, index) => {
          // Extract coordinates
          let lat = null, lon = null;
          
          // Try different coordinate sources
          if (job.locationCoordinates && Array.isArray(job.locationCoordinates) && job.locationCoordinates.length === 2) {
            [lon, lat] = job.locationCoordinates;
          } else if (job.location && job.location.coordinates && Array.isArray(job.location.coordinates) && job.location.coordinates.length === 2) {
            [lon, lat] = job.location.coordinates;
          } else if (job.coordinates && Array.isArray(job.coordinates) && job.coordinates.length === 2) {
            [lon, lat] = job.coordinates;
          } else if (job.lon && job.lat) {
            lon = job.lon;
            lat = job.lat;
          }
          
          // Validate coordinates
          const latNum = parseFloat(lat);
          const lonNum = parseFloat(lon);
          
          if (isNaN(latNum) || isNaN(lonNum) || latNum === 0 || lonNum === 0) {
            console.log(`Invalid coordinates for job ${job.jobNo || index}: lat=${lat}, lon=${lon}`);
            return;
          }
          
          // Create marker
          const color = statusColors[job.status] || '#3388ff';
          
          // Create custom marker icon
          const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${color};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              color: white;
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
          });
          
          // Create popup content
          const popupContent = `
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${job.jobNo || 'N/A'}</h4>
              <p style="margin: 4px 0;"><strong>Status:</strong> ${job.status || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${job.type || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Priority:</strong> ${job.priority || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${job.locationName || job.location?.name || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Province:</strong> ${job.locationProvince || job.location?.province || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Customer:</strong> ${job.customerName || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Technician:</strong> ${job.technicianNames || job.technician_names || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Created:</strong> ${job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          `;
          
          // Create and add marker
          const marker = L.marker([latNum, lonNum], { icon: markerIcon })
            .bindPopup(popupContent);
          
          markersLayer.current.addLayer(marker);
          bounds.extend([latNum, lonNum]);
          validMarkers++;
        });
        
        console.log(`Added ${validMarkers} valid markers to map`);
        
        // Fit map to show all markers
        if (validMarkers > 0) {
          // Add some padding to the bounds
          const paddedBounds = bounds.pad(0.1);
          leafletMap.current.fitBounds(paddedBounds);
        } else {
          // Default view for Thailand if no markers
          leafletMap.current.setView([13.7563, 100.5018], 6);
        }
        
        // Add legend
        addLegend(L, statusColors);
        
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };
    
    updateMarkers();
  }, [data, mapInitialized, loading]);

  // Add legend to map
  const addLegend = (L, statusColors) => {
    // Remove existing legend
    if (window.mapLegend) {
      leafletMap.current.removeControl(window.mapLegend);
    }
    
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.cssText = `
        background: white;
        padding: 10px;
        border: 2px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 16px;
      `;
      
      let legendHTML = '<h4 style="margin: 0 0 8px 0;">Job Status</h4>';
      
      Object.entries(statusColors).forEach(([status, color]) => {
        legendHTML += `
          <div style="margin: 4px 0; display: flex; align-items: center;">
            <div style="
              width: 12px; 
              height: 12px; 
              background-color: ${color}; 
              border-radius: 50%; 
              margin-right: 8px; 
              border: 1px solid #ccc;
            "></div>
            <span>${status}</span>
          </div>
        `;
      });
      
      div.innerHTML = legendHTML;
      return div;
    };
    
    legend.addTo(leafletMap.current);
    window.mapLegend = legend;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        minHeight: 500,
        borderRadius: 3,
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.background.default, 0.5)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ height: '100%', p: 2 }}>
        {title && (
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'block',
                width: 4,
                height: 20,
                borderRadius: 4,
                bgcolor: theme.palette.primary.main,
                mr: 1.5,
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`
              }
            }}
          >
            {title}
          </Typography>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="calc(100% - 30px)">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>Loading map...</Typography>
          </Box>
        ) : !leafletLoaded ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="calc(100% - 30px)">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>Loading map library...</Typography>
          </Box>
        ) : (
          <Box 
            ref={mapRef} 
            sx={{ 
              height: title ? 'calc(100% - 50px)' : '100%', 
              width: '100%', 
              minHeight: 450,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              '& .leaflet-container': {
                height: '100%',
                width: '100%',
                borderRadius: 'inherit'
              }
            }} 
          />
        )}
        
        {!loading && data && data.length === 0 && (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="200px"
            sx={{ 
              border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
              borderRadius: 2,
              mt: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No job locations to display
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default JobMap;