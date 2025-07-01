import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { getValueByPath } from '../../../services/apiBinding';

interface WidgetPreviewProps {
  widgetType: string;
  currentMapping: any;
  apiResponse: any;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  widgetType,
  currentMapping,
  apiResponse,
}) => {
  if (!currentMapping || Object.keys(currentMapping).length === 0) {
    return (
      <Alert severity="info">
        No mapping configured yet. Select JSON paths and map them to widget fields to see a preview.
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Live Preview
        <Tooltip title="This preview shows how your widget will look with the current mapping">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      
      {/* Preview for dropdown-type widgets */}
      {['select', 'multiselect', 'autocomplete'].includes(widgetType) && 
       currentMapping.options?.path !== undefined && (
        <Box>
          <FormControl fullWidth>
            <InputLabel>
              {widgetType === 'multiselect' ? 'Multi-Select' : widgetType === 'autocomplete' ? 'Autocomplete' : 'Select'}
            </InputLabel>
            <Select
              value=""
              label={widgetType === 'multiselect' ? 'Multi-Select' : widgetType === 'autocomplete' ? 'Autocomplete' : 'Select'}
              multiple={widgetType === 'multiselect'}
            >
              {(() => {
                // Get the options array based on the path
                const path = currentMapping.options.path;
                const options = path ? getValueByPath(apiResponse, path) : apiResponse;
                
                if (!options || !Array.isArray(options) || options.length === 0) {
                  return <MenuItem value="">No options available</MenuItem>;
                }
                
                return options.map((item: any, index: number) => {
                  const value = item[currentMapping.options?.valueField || ''];
                  const label = item[currentMapping.options?.labelField || ''];
                  return (
                    <MenuItem key={index} value={value || ''}>
                      {label || value || `Option ${index + 1}`}
                    </MenuItem>
                  );
                });
              })()}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {(() => {
                const path = currentMapping.options.path;
                const options = path ? getValueByPath(apiResponse, path) : apiResponse;
                return `Showing ${Array.isArray(options) ? options.length : 0} options with value field "${currentMapping.options.valueField}" and label field "${currentMapping.options.labelField || ''}"`;
              })()}
            </Typography>
          </FormControl>
        </Box>
      )}
      
      {/* Preview for table widget */}
      {widgetType === 'table' && currentMapping.tableData?.path !== undefined && (
        <Box sx={{ overflowX: 'auto' }}>
          <Typography variant="body2" gutterBottom>Table Preview:</Typography>
          {(() => {
            const path = currentMapping.tableData.path;
            const data = path ? getValueByPath(apiResponse, path) : apiResponse;
            
            if (!data || !Array.isArray(data) || data.length === 0) {
              return (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No table data available at the specified path
                </Alert>
              );
            }
            
            // Get first row for headers
            const firstRow = data[0];
            const headers = Object.keys(firstRow);
            
            return (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {headers.map((header, index) => (
                        <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.slice(0, 5).map((row: any, rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((cell: any, cellIndex: number) => (
                          <TableCell key={cellIndex}>
                            {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            );
          })()}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Showing preview of first 5 rows
          </Typography>
        </Box>
      )}
      
      {/* Preview for text/number widgets */}
      {['textfield', 'number'].includes(widgetType) && currentMapping.value?.path !== undefined && (
        <Box>
          <TextField
            label={widgetType === 'number' ? 'Number Field' : 'Text Field'}
            value={(() => {
              const path = currentMapping.value.path;
              const value = path ? getValueByPath(apiResponse, path) : '';
              return value !== undefined && value !== null ? String(value) : '';
            })()}
            type={widgetType === 'number' ? 'number' : 'text'}
            fullWidth
            disabled
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Preview showing value from path: {currentMapping.value.path}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default WidgetPreview;
