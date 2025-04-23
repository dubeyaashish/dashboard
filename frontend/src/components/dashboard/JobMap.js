// File: frontend/src/components/dashboard/JobMap.js
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, alpha, useTheme } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const JobMap = ({ data, title, loading }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    // Import leaflet dynamically to avoid SSR issues
    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet.markercluster');
        await import('leaflet.markercluster/dist/MarkerCluster.css');
        await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
        
        if (!mapRef.current || mapInitialized) return;
        
        // Initialize the map if it doesn't exist
        leafletMap.current = L.map(mapRef.current).setView([15.87, 100.99], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMap.current);
        
        // Initialize marker cluster
        markersLayer.current = L.markerClusterGroup();
        leafletMap.current.addLayer(markersLayer.current);
        
        console.log("Map initialized successfully");
        setMapInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
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
      
      try {
        const L = await import('leaflet');
        
        // Clear existing markers
        markersLayer.current.clearLayers();
        
        // Status colors for markers - match Streamlit implementation
        const statusColors = {
          'WAITINGJOB': '#FFA500', // orange
          'WORKING': '#1E90FF',    // blue
          'PENDING': '#FFD700',    // yellow
          'COMPLETED': '#32CD32',  // green
          'CLOSED': '#006400',     // dark green
          'CANCELLED': '#DC143C',  // crimson
          'REVIEW': '#9932CC'      // purple
        };
        
        console.log(`Adding ${data.length} markers to map`);
        
        // Count of valid markers added
        let validMarkers = 0;
        
        // Add new markers
        data.forEach(job => {
          // Coordinates checks - match Streamlit implementation
          let lat = null, lon = null;
          
          if (job.location && job.location.coordinates) {
            // Try to extract from location.coordinates array
            if (Array.isArray(job.location.coordinates) && job.location.coordinates.length === 2) {
              [lon, lat] = job.location.coordinates;
            }
          } else if (job.lon !== undefined && job.lat !== undefined) {
            // Direct lon/lat properties
            lon = job.lon;
            lat = job.lat;
          }
          
          if (!lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
            return; // Skip invalid coordinates
          }
          
          validMarkers++;
          const color = statusColors[job.status] || '#3388ff';
          
          // Create custom pin marker like in Streamlit
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
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          `;
          
          const icon = L.divIcon({
            className: "custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<span style="${markerHtmlStyles}" />`
          });
          
          // Format popup similar to Streamlit
          const popupContent = `
            <div style="font-family: Arial; width: 200px;">
              <b>Job No:</b> ${job.jobNo || 'N/A'}<br>
              <b>Status:</b> ${job.status || 'N/A'}<br>
              <b>Type:</b> ${job.type || 'N/A'}<br>
              <b>Location:</b> ${job.location?.name || 'N/A'}<br>
              <b>Customer:</b> ${job.customerName || 'N/A'}<br>
              <b>Technician:</b> ${job.technicianNames || 'N/A'}<br>
              <b>Created:</b> ${job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}
            </div>
          `;
          
          const marker = L.marker([lat, lon], { icon }).bindPopup(popupContent);
          markersLayer.current.addLayer(marker);
        });
        
        console.log(`Added ${validMarkers} valid markers to map`);
        
        // Fit bounds if we have markers
        if (markersLayer.current.getLayers().length > 0) {
          leafletMap.current.fitBounds(markersLayer.current.getBounds(), { padding: [50, 50] });
        } else {
          // Default view if no markers
          leafletMap.current.setView([15.87, 100.99], 6);
        }
        
        // Add legend like in Streamlit
        if (document.querySelector('.map-legend')) {
          document.querySelector('.map-legend').remove();
        }
        
        const legend = L.control({ position: 'bottomleft' });
        legend.onAdd = function() {
          const div = L.DomUtil.create('div', 'info legend map-legend');
          div.style.backgroundColor = 'white';
          div.style.padding = '10px';
          div.style.border = '2px solid grey';
          div.style.borderRadius = '5px';
          
          div.innerHTML = '<p><b>Job Status</b></p>';
          Object.entries(statusColors).forEach(([status, color]) => {
            div.innerHTML += `
              <p><i style="background-color: ${color}; width: 10px; height: 10px; display: inline-block; border-radius: 50%;"></i> ${status}</p>
            `;
          });
          
          return div;
        };
        
        legend.addTo(leafletMap.current);
        
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };
    
    updateMarkers();
  }, [data, mapInitialized, loading]);
  
  // If there are no coordinates, show province-level aggregation like in Streamlit
  const showProvinceAggregation = () => {
    if (!mapInitialized || !data || data.length === 0) return;
    
    const updateProvinceMarkers = async () => {
      try {
        const L = await import('leaflet');
        
        // Clear existing markers
        markersLayer.current.clearLayers();
        
        // Group by province
        const provinceGroups = {};
        data.forEach(job => {
          const province = job.location?.province || 'Unknown';
          if (!provinceGroups[province]) {
            provinceGroups[province] = {
              count: 0,
              coordinates: null
            };
          }
          provinceGroups[province].count++;
          
          // Use first valid coordinates found for the province
          if (!provinceGroups[province].coordinates) {
            let lat = null, lon = null;
            if (job.location?.coordinates?.length === 2) {
              [lon, lat] = job.location.coordinates;
            } else if (job.lat && job.lon) {
              lat = job.lat;
              lon = job.lon;
            }
            
            if (lat && lon) {
              provinceGroups[province].coordinates = [lat, lon];
            }
          }
        });
        
        // Fallback coordinates for provinces
        const provinceCoordinates = {
          "Bangkok": [13.7563, 100.5018],
          "Chiang Mai": [18.7883, 98.9853],
          "Phuket": [7.9519, 98.3381],
          "Chon Buri": [13.3611, 100.9847],
          "Songkhla": [7.1756, 100.6142],
          "Nakhon Ratchasima": [14.9801, 102.0978],
          "Khon Kaen": [16.4419, 102.8360],
          "Rayong": [12.6831, 101.2376],
          "Udon Thani": [17.4138, 102.7870],
          "Chiang Rai": [19.9105, 99.8406]
        };
        
        // Get maximum count for scaling
        const maxCount = Math.max(...Object.values(provinceGroups).map(g => g.count));
        
        // Add province circles
        Object.entries(provinceGroups).forEach(([province, data]) => {
          // Use provided coordinates or fallback
          let coordinates = data.coordinates;
          if (!coordinates && provinceCoordinates[province]) {
            coordinates = provinceCoordinates[province];
          }
          
          if (!coordinates) return;
          
          // Scale marker size based on count
          const radius = 5 + (data.count / maxCount * 25);
          
          // Add circle marker
          L.circleMarker(coordinates, {
            radius: radius,
            fillColor: '#3388ff',
            color: '#ffffff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
          })
          .bindPopup(`<b>${province}</b>: ${data.count} jobs`)
          .addTo(markersLayer.current);
          
          // Add text label
          L.divIcon({
            html: `<div style="font-weight: bold; font-size: ${10 + data.count / maxCount * 6}px; text-align: center;">${province}</div>`,
            className: 'province-label',
            iconSize: [120, 20],
            iconAnchor: [60, 10]
          });
        });
        
        // Fit map to markers
        if (markersLayer.current.getLayers().length > 0) {
          leafletMap.current.fitBounds(markersLayer.current.getBounds(), { padding: [50, 50] });
        }
        
      } catch (error) {
        console.error("Error updating province markers:", error);
      }
    };
    
    updateProvinceMarkers();
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
          </Box>
        ) : (
          <Box 
            ref={mapRef} 
            sx={{ 
              height: title ? 'calc(100% - 30px)' : '100%', 
              width: '100%', 
              minHeight: 450,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default JobMap;