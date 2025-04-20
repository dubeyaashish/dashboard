import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

const BarChart = ({ 
  data, 
  title, 
  xAxisKey = '_id', 
  dataKey = 'count',
  color = '#1E90FF',
  horizontal = false,
  height = 300
}) => {
  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: '100%', minHeight: height }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={height - 80}>
            <Typography variant="body2" color="textSecondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', minHeight: height }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={height - 80}>
          {horizontal ? (
            <RechartsBarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey={dataKey} fill={color} />
            </RechartsBarChart>
          ) : (
            <RechartsBarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisKey} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }} 
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill={color} />
            </RechartsBarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarChart;