import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
  Paper,
  alpha,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  MoreHoriz as MoreHorizIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';

const getStatusColor = (status) => {
  const statusColors = {
    'WAITINGJOB': 'warning',
    'WORKING': 'info',
    'PENDING': 'default',
    'COMPLETED': 'success',
    'CLOSED': 'success',
    'CANCELLED': 'error',
    'REVIEW': 'secondary'
  };
  
  return statusColors[status] || 'default';
};

const getPriorityColor = (priority) => {
  const priorityColors = {
    'HIGH': 'error',
    'MEDIUM': 'warning',
    'LOW': 'success'
  };
  
  return priorityColors[priority] || 'default';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const DataTable = ({ 
  data, 
  title, 
  columns,
  totalCount,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onRowClick
}) => {
  const theme = useTheme();

  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  const renderCellContent = (row, column) => {
    const value = row[column.id];
    
    if (column.id === 'status') {
      return (
        <Chip 
          label={value} 
          color={getStatusColor(value)} 
          size="small"
          sx={{ 
            fontWeight: 500,
            px: 1,
            '& .MuiChip-label': {
              px: 0.8
            }
          }} 
        />
      );
    }
    
    if (column.id === 'priority') {
      return (
        <Chip 
          label={value} 
          color={getPriorityColor(value)} 
          size="small"
          sx={{ 
            fontWeight: 500,
            px: 1,
            '& .MuiChip-label': {
              px: 0.8
            }
          }} 
        />
      );
    }
    
    if (column.format === 'date') {
      return formatDate(value);
    }
    
    return value;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.background.default, 0.5)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box 
          p={2.5} 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography 
            variant="h6"
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

          <Tooltip title="More options">
            <IconButton size="small">
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: 400,
            bgcolor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
            borderRadius: 0,
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.numeric ? 'right' : 'left'}
                    style={{ minWidth: column.minWidth }}
                    sx={{ 
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      py: 1.5,
                      px: 2,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell 
                    align="center" 
                    sx={{ 
                      width: 50,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  ></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <TableRow
                    hover
                    key={row.id || row._id || rowIndex}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:nth-of-type(odd)': {
                        bgcolor: alpha(theme.palette.action.hover, 0.05),
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                      },
                      '&:last-child td, &:last-child th': {
                        border: 0,
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={`${row.id || row._id || rowIndex}-${column.id}`} 
                        align={column.numeric ? 'right' : 'left'}
                        sx={{ 
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                          py: 1.5,
                          px: 2,
                        }}
                      >
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                    {onRowClick && (
                      <TableCell 
                        align="center"
                        sx={{ 
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                          color: theme.palette.text.secondary
                        }}
                      >
                        <IconButton size="small">
                          <KeyboardArrowRightIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (onRowClick ? 1 : 0)} 
                    align="center"
                    sx={{ 
                      py: 6,
                      borderBottom: 'none',
                      color: theme.palette.text.secondary
                    }}
                  >
                    <Typography variant="body2">No data available</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      Try changing filters or refreshing the page
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {onPageChange && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{ 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: theme.palette.text.secondary,
              },
              '.MuiTablePagination-select': {
                color: theme.palette.text.primary,
              },
              '.MuiTablePagination-actions': {
                color: theme.palette.text.primary,
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;