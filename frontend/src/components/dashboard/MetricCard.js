// src/components/dashboard/MetricCard.js
import React from 'react';
import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const MetricCard = ({ title, value, delta, icon, color = 'primary' }) => {
  const isPositiveDelta = delta >= 0;
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible',
        boxShadow: `0 8px 16px ${alpha(theme.palette.background.default, 0.5)}`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 20px ${alpha(theme.palette.background.default, 0.6)}`,
        }
      }}
    >
      {/* Decorative top accent */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -10, 
          left: 20, 
          right: 20, 
          height: 4, 
          bgcolor: theme.palette[color].main,
          borderRadius: 4,
          boxShadow: `0 0 10px ${alpha(theme.palette[color].main, 0.7)}`,
        }} 
      />
      
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="bold"
              sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.05em'
              }}
            >
              {value}
            </Typography>
            {delta !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: isPositiveDelta 
                      ? alpha(theme.palette.success.main, 0.1) 
                      : alpha(theme.palette.error.main, 0.1),
                    borderRadius: 10,
                    px: 1,
                    py: 0.5
                  }}
                >
                  {isPositiveDelta ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography 
                    variant="caption" 
                    color={isPositiveDelta ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                    ml={0.5}
                  >
                    {isPositiveDelta ? '+' : ''}{delta}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          {icon && (
            <Box 
              sx={{ 
                bgcolor: alpha(theme.palette[color].main, 0.15), 
                color: theme.palette[color].main,
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 12px ${alpha(theme.palette[color].main, 0.2)}`,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        
        {/* Decorative pattern */}
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 80,
            height: 80,
            opacity: 0.05,
            backgroundImage: `radial-gradient(${theme.palette[color].main} 2px, transparent 2px)`,
            backgroundSize: '12px 12px',
            borderTopLeftRadius: 100,
            zIndex: 0,
          }} 
        />
      </CardContent>
    </Card>
  );
};

export default MetricCard;