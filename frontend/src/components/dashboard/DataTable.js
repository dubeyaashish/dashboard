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
  Paper
} from '@mui/material';

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
      return <Chip label={value} color={getStatusColor(value)} size="small" />;
    }
    
    if (column.id === 'priority') {
      return <Chip label={value} color={getPriorityColor(value)} size="small" />;
    }
    
    if (column.format === 'date') {
      return formatDate(value);
    }
    
    return value;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0 }}>
        <Box p={2}>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.numeric ? 'right' : 'left'}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow
                    hover
                    key={row.id || row._id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No data available
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
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;