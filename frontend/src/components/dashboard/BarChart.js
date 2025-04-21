import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';

const BarChart = ({ 
  data, 
  title, 
  xAxisKey = '_id', 
  dataKey = 'count',
  color = '#6366F1',
  horizontal = false,
  height = 300
}) => {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            p: 1.5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 1,
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
            backdropFilter: 'blur(4px)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.primary">
            Count: <strong>{payload[0].value}</strong>
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          minHeight: height,
          borderRadius: 3,
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.background.default, 0.5)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent>
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
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height={height - 80}
            sx={{
              border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.4)
            }}
          >
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        minHeight: height,
        borderRadius: 3,
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.background.default, 0.5)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent>
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
              bgcolor: color,
              mr: 1.5,
              boxShadow: `0 0 10px ${alpha(color, 0.5)}`
            }
          }}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height - 80}>
          {horizontal ? (
            <RechartsBarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              barGap={8}
              barCategoryGap={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                axisLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tickLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                dataKey={xAxisKey} 
                type="category" 
                width={80} 
                axisLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tickLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.action.hover, 0.1) }} />
              <Bar 
                dataKey={dataKey} 
                fill={color}
                background={{ fill: alpha(theme.palette.action.hover, 0.05) }}
                radius={[0, 4, 4, 0]}
                style={{
                  filter: `drop-shadow(0px 0px 4px ${alpha(color, 0.4)})`
                }}
              />
            </RechartsBarChart>
          ) : (
            <RechartsBarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              barGap={8}
              barCategoryGap={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} vertical={false} />
              <XAxis 
                dataKey={xAxisKey} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }} 
                axisLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tickLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
              />
              <YAxis 
                axisLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tickLine={{ stroke: alpha(theme.palette.divider, 0.15) }}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.action.hover, 0.1) }} />
              <Bar 
                dataKey={dataKey} 
                fill={color}
                background={{ fill: alpha(theme.palette.action.hover, 0.05) }}
                radius={[4, 4, 0, 0]}
                style={{
                  filter: `drop-shadow(0px 0px 4px ${alpha(color, 0.4)})`
                }}
              />
            </RechartsBarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarChart;