import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';

const StatusPieChart = ({ data, title, dataKey = "count", nameKey = "_id" }) => {
  const theme = useTheme();

  // Enhanced colors with glow effect
  const COLORS = {
    'WAITINGJOB': '#F59E0B', // Amber
    'WORKING': '#3B82F6', // Blue
    'PENDING': '#A3A3A3', // Gray
    'COMPLETED': '#10B981', // Green
    'CLOSED': '#059669', // Dark Green
    'CANCELLED': '#EF4444', // Red
    'REVIEW': '#8B5CF6' // Purple
  };

  const DEFAULT_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#3B82F6'];

  if (!data || data.length === 0) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          minHeight: 300,
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
            height={220}
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

  const getColor = (entry, index) => {
    return COLORS[entry[nameKey]] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: getColor(data, 0),
              fontWeight: 600
            }}
          >
            {data[nameKey]}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            Count: <b>{data[dataKey]}</b>
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {Math.round((data[dataKey] / data.value) * 100)}% of total
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only display labels for sections with significant percentage
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill={theme.palette.mode === 'dark' ? '#fff' : '#000'}
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }) => {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          gap: 1,
          mt: 2
        }}
      >
        {payload.map((entry, index) => (
          <Box 
            key={`legend-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: alpha(entry.color, 0.1),
              border: `1px solid ${alpha(entry.color, 0.2)}`,
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: entry.color,
                boxShadow: `0 0 6px ${alpha(entry.color, 0.6)}`,
                mr: 1
              }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        minHeight: 300,
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
        <Box height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                cornerRadius={4}
                paddingAngle={2}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                strokeWidth={1}
                stroke={theme.palette.background.paper}
              >
                {data.map((entry, index) => {
                  const color = getColor(entry, index);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={color} 
                      style={{
                        filter: `drop-shadow(0px 0px 4px ${alpha(color, 0.6)})`
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;