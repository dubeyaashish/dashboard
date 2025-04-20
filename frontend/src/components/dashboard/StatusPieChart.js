import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

const COLORS = {
  'WAITINGJOB': '#FFA500',
  'WORKING': '#1E90FF',
  'PENDING': '#FFD700',
  'COMPLETED': '#32CD32',
  'CLOSED': '#006400',
  'CANCELLED': '#DC143C',
  'REVIEW': '#9932CC'
};

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#70D6FF'];

const StatusPieChart = ({ data, title, dataKey = "count", nameKey = "_id" }) => {
  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={220}>
            <Typography variant="body2" color="textSecondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getColor = (entry, index) => {
    return COLORS[entry[nameKey]] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={30}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, 'Count']}
              labelFormatter={(value) => `Status: ${value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;