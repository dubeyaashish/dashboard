// src/components/dashboard/MetricCard.js
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const MetricCard = ({ title, value, delta, icon, color = 'primary' }) => {
  const isPositiveDelta = delta >= 0;
  
  return (
    <Card sx={{ height: '100%', borderTop: 4, borderColor: `${color}.main` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {delta !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositiveDelta ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={isPositiveDelta ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {isPositiveDelta ? '+' : ''}{delta}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box 
              sx={{ 
                bgcolor: `${color}.lighter`, 
                p: 1.5, 
                borderRadius: 2,
                color: `${color}.main`
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;