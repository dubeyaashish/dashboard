// File: frontend/src/components/dashboard/JobMap.js (FIXED - Proper initialization)
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, alpha, useTheme } from '@mui/material';

const JobMap = ({ data, title, loading }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const theme = useTheme();

  // FIXED: Load Leaflet more reliably
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        console.log('🗺️ Loading Leaflet...');
        
        // Check if Leaflet is already loaded
        if (window.L) {
          console.log('✅ Leaflet already available');
          setLeafletLoaded(true);
          return;
        }

        // Load Leaflet CSS first
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          document.head.appendChild(cssLink);
        }

        // Load marker cluster CSS
        if (!document.querySelector('link[href*="MarkerCluster.css"]')) {
          const clusterCss = document.createElement('link');
          clusterCss.rel = 'stylesheet';
          clusterCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
          document.head.appendChild(clusterCss);
          
          const clusterDefaultCss = document.createElement('link');
          clusterDefaultCss.rel = 'stylesheet';
          clusterDefaultCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
          document.head.appendChild(clusterDefaultCss);
        }

        // Dynamically import Leaflet
        const L = await import('leaflet');
        
        // Import marker cluster
        await import('leaflet.markercluster');
        
        // IMPORTANT: Fix default icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Make L available globally
        window.L = L;
        setLeafletLoaded(true);
        console.log('✅ Leaflet loaded successfully');
      } catch (error) {
        console.error('❌ Error loading Leaflet:', error);
        setInitError(`Failed to load Leaflet: ${error.message}`);
      }
    };

    loadLeaflet();
  }, []);

  // FIXED: Initialize map when both Leaflet is loaded and container is ready
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInitialized) {
      console.log('⏳ Map init conditions not met:', {
        leafletLoaded,
        hasContainer: !!mapRef.current,
        mapInitialized
      });
      return;
    }

    const initializeMap = () => {
      try {
        console.log('🗺️ Initializing map...');
        const L = window.L;
        
        // Clear any existing map
        if (leafletMap.current) {
          leafletMap.current.remove();
          leafletMap.current = null;
          markersLayer.current = null;
        }
        
        // Initialize the map
        leafletMap.current = L.map(mapRef.current, {
          center: [13.7563, 100.5018], // Bangkok coordinates
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: true
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
        
        console.log('✅ Map initialized successfully');
        setMapInitialized(true);
        setInitError(null);
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        setInitError(`Failed to initialize map: ${error.message}`);
      }
    };
    
    // Small delay to ensure DOM is ready
    setTimeout(initializeMap, 100);
    
    // Cleanup function
    return () => {
      if (leafletMap.current) {
        console.log('🧹 Cleaning up map');
        leafletMap.current.remove();
        leafletMap.current = null;
        markersLayer.current = null;
        setMapInitialized(false);
      }
    };
  }, [leafletLoaded, mapInitialized]);
  
  // FIXED: Update markers when data changes
  useEffect(() => {
    console.log('🔄 Map update triggered:', {
      mapInitialized,
      hasMarkersLayer: !!markersLayer.current,
      hasData: !!data,
      dataLength: data?.length,
      loading,
      hasLeaflet: !!window.L
    });

    if (!mapInitialized || !markersLayer.current || !data || loading || !window.L) {
      console.log('❌ Map update skipped - conditions not met');
      return;
    }
    
    const updateMarkers = () => {
      try {
        console.log(`🗺️ Processing ${data.length} jobs for map markers`);
        const L = window.L;
        
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
        
        let validMarkers = 0;
        let invalidCoordinates = 0;
        const bounds = L.latLngBounds();
        
        // Add markers for each job
        data.forEach((job, index) => {
          if (index % 1000 === 0) {
            console.log(`Processing job ${index + 1}/${data.length}...`);
          }
          
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
          } else {
            invalidCoordinates++;
            return;
          }
          
          // Validate coordinates
          const latNum = parseFloat(lat);
          const lonNum = parseFloat(lon);
          
          if (isNaN(latNum) || isNaN(lonNum) || latNum === 0 || lonNum === 0) {
            invalidCoordinates++;
            return;
          }
          
          // Basic Thailand bounds check (optional)
          if (latNum < 5 || latNum > 21 || lonNum < 97 || lonNum > 106) {
            // Still add it, but log as potentially outside Thailand
            if (validMarkers < 5) {
              console.log(`⚠️ Job ${job.jobNo} coordinates outside Thailand bounds: [${lonNum}, ${latNum}]`);
            }
          }
          
          // Create marker
          const color = statusColors[job.status] || '#3388ff';
          
          // Create simple marker icon
          const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${color};
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            popupAnchor: [0, -6]
          });
          
          // Create popup content
          const popupContent = `
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${job.jobNo || 'N/A'}</h4>
              <p style="margin: 4px 0;"><strong>Status:</strong> ${job.status || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${job.type || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${job.locationName || job.location?.name || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Province:</strong> ${job.locationProvince || job.location?.province || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Customer:</strong> ${job.customerName || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Technician:</strong> ${job.technicianNames || job.technician_names || 'N/A'}</p>
            </div>
          `;
          
          // Create and add marker
          const marker = L.marker([latNum, lonNum], { icon: markerIcon })
            .bindPopup(popupContent);
          
          markersLayer.current.addLayer(marker);
          bounds.extend([latNum, lonNum]);
          validMarkers++;
        });
        
        console.log(`✅ Added ${validMarkers} valid markers to map`);
        console.log(`❌ Skipped ${invalidCoordinates} jobs with invalid coordinates`);
        
        // Fit map to show all markers
        if (validMarkers > 0) {
          const paddedBounds = bounds.pad(0.1);
          leafletMap.current.fitBounds(paddedBounds);
          console.log('🎯 Map bounds adjusted to show all markers');
        } else {
          // Default view for Thailand if no markers
          leafletMap.current.setView([13.7563, 100.5018], 6);
          console.log('🎯 No markers found, using default Thailand view');
        }
        
        // Add simple legend
        addLegend(L, statusColors);
        
      } catch (error) {
        console.error('❌ Error updating markers:', error);
        setInitError(`Error updating markers: ${error.message}`);
      }
    };
    
    updateMarkers();
  }, [data, mapInitialized, loading]);

  // Add legend to map
  const addLegend = (L, statusColors) => {
    try {
      // Remove existing legend
      if (window.mapLegend) {
        leafletMap.current.removeControl(window.mapLegend);
      }
      
      const legend = L.control({ position: 'bottomright' });
      
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `
          background: white;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.2);
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 14px;
        `;
        
        let legendHTML = '<div style="margin-bottom: 4px; font-weight: bold;">Job Status</div>';
        
        Object.entries(statusColors).forEach(([status, color]) => {
          legendHTML += `
            <div style="margin: 2px 0; display: flex; align-items: center;">
              <div style="
                width: 8px; 
                height: 8px; 
                background-color: ${color}; 
                border-radius: 50%; 
                margin-right: 6px; 
                border: 1px solid #fff;
              "></div>
              <span style="font-size: 10px;">${status}</span>
            </div>
          `;
        });
        
        div.innerHTML = legendHTML;
        return div;
      };
      
      legend.addTo(leafletMap.current);
      window.mapLegend = legend;
    } catch (error) {
      console.error('❌ Error adding legend:', error);
    }
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
        
        {/* Error display */}
        {initError && (
          <Box sx={{ 
            mb: 1, 
            p: 1, 
            bgcolor: alpha(theme.palette.error.main, 0.1), 
            borderRadius: 1,
            color: theme.palette.error.main
          }}>
            <Typography variant="caption">
              Error: {initError}
            </Typography>
          </Box>
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