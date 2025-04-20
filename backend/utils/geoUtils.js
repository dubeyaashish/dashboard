// utils/geoUtils.js
import fs from 'fs/promises';
import path from 'path';

// Function to load GeoJSON data for Thailand provinces
export const loadThailandGeoJSON = async () => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'thailand_provinces.geojson');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading Thailand GeoJSON:', error);
    return null;
  }
};

// Function to convert MongoDB job data to GeoJSON format
export const jobsToGeoJSON = (jobs) => {
  const features = jobs
    .filter(job => job.location?.coordinates?.length === 2)
    .map(job => {
      const [lon, lat] = job.location.coordinates;
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          id: job._id || job.id,
          jobNo: job.jobNo || job.no,
          status: job.status,
          type: job.type,
          priority: job.priority,
          location: job.locationName || job.location?.name,
          province: job.locationProvince || job.location?.province,
          district: job.locationDistrict || job.location?.district,
          technicians: job.technicianNames,
          createdAt: job.createdAt,
          customerName: job.customerName
        }
      };
    });
  
  return {
    type: 'FeatureCollection',
    features
  };
};

// Create a simple way to get province center coordinates
export const getProvinceCenter = (provinceName, geoJSON) => {
  if (!geoJSON || !geoJSON.features) return [13.7563, 100.5018]; // Default to Bangkok
  
  const province = geoJSON.features.find(
    feature => feature.properties.name === provinceName || 
               feature.properties.name_en === provinceName
  );
  
  if (!province || !province.geometry) return [13.7563, 100.5018];
  
  // If it's a Point, return the coordinates directly
  if (province.geometry.type === 'Point') {
    return province.geometry.coordinates;
  }
  
  // If it's a Polygon or MultiPolygon, calculate the centroid
  if (province.geometry.type === 'Polygon') {
    const coordinates = province.geometry.coordinates[0];
    return calculateCentroid(coordinates);
  }
  
  if (province.geometry.type === 'MultiPolygon') {
    // Take the first polygon's centroid for simplicity
    const coordinates = province.geometry.coordinates[0][0];
    return calculateCentroid(coordinates);
  }
  
  return [13.7563, 100.5018];
};

// Helper function to calculate centroid of a set of points
const calculateCentroid = (coordinates) => {
  let sumX = 0;
  let sumY = 0;
  
  coordinates.forEach(coord => {
    sumX += coord[0];
    sumY += coord[1];
  });
  
  return [sumX / coordinates.length, sumY / coordinates.length];
};

// Add a new route to serve the GeoJSON data
export const addGeoJSONRoute = (app) => {
  app.get('/api/geojson/thailand', async (req, res) => {
    try {
      const geoJSON = await loadThailandGeoJSON();
      if (!geoJSON) {
        return res.status(404).json({ 
          success: false, 
          error: 'GeoJSON data not found' 
        });
      }
      
      res.json({
        success: true,
        data: geoJSON
      });
    } catch (error) {
      console.error('Error serving GeoJSON:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to serve GeoJSON data' 
      });
    }
  });
};