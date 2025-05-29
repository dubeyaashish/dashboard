// File: frontend/src/components/layout/LanguageSwitcher.js
import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Tooltip, 
  alpha, 
  useTheme 
} from '@mui/material';
import { 
  Translate as TranslateIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change Language">
        <IconButton 
          color="inherit" 
          onClick={handleClick}
          sx={{ 
            mx: 0.5,
            position: 'relative'
          }}
        >
          <TranslateIcon />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              fontSize: '0.6rem',
              fontWeight: 'bold',
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              color: theme.palette.primary.contrastText,
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {language === 'en' ? 'EN' : 'TH'}
          </Typography>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            minWidth: 150,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
          sx={{ 
            py: 1.5,
            '&.Mui-selected': {
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            } 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            English
            {language === 'en' && (
              <CheckIcon fontSize="small" sx={{ ml: 'auto', color: theme.palette.primary.main }} />
            )}
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('th')}
          selected={language === 'th'}
          sx={{ 
            py: 1.5,
            '&.Mui-selected': {
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            } 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            ภาษาไทย (Thai)
            {language === 'th' && (
              <CheckIcon fontSize="small" sx={{ ml: 'auto', color: theme.palette.primary.main }} />
            )}
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;