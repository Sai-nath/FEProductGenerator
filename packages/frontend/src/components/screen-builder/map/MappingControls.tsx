import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface MappingControlsProps {
  widgetType: string;
  selectedPath: string;
  targetField: { field: string; subField: string } | null;
  mappedFields: Record<string, { path: string; field: string; subField: string }>;
  onTargetFieldChange: (field: string, subField: string) => void;
  onMapField: () => void;
  onRemoveMapping: (field: string, subField: string) => void;
  onAutoMap: () => void;
}

const MappingControls: React.FC<MappingControlsProps> = ({
  widgetType,
  selectedPath,
  targetField,
  mappedFields,
  onTargetFieldChange,
  onMapField,
  onRemoveMapping,
  onAutoMap,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  
  // Get available target fields based on widget type
  const getAvailableTargetFields = () => {
    switch (widgetType) {
      case 'select':
      case 'multiselect':
      case 'autocomplete':
        return [
          { field: 'options', subField: 'path', label: 'Options Data Path', required: true, description: 'Array of items for the dropdown options' },
          { field: 'options', subField: 'valueField', label: 'Value Field', required: false, description: 'Field in each item to use as the option value' },
          { field: 'options', subField: 'labelField', label: 'Label Field', required: false, description: 'Field in each item to display in the dropdown' },
        ];
      case 'table':
        return [
          { field: 'tableData', subField: 'path', label: 'Table Data Path', required: true, description: 'Array of items for the table rows' },
        ];
      case 'textfield':
      case 'number':
      default:
        return [
          { field: 'value', subField: 'path', label: 'Value Path', required: true, description: 'Path to the value to display in this field' },
        ];
    }
  };

  const availableTargetFields = getAvailableTargetFields();

  return (
    <Box sx={{ mt: 2 }}>
      {/* Copy success notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message={`${copiedText} copied to clipboard`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Field Mapping</Typography>
          <Tooltip title="Map JSON paths from your API response to widget fields">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Step 1: Select JSON Path
          </Typography>
          <TextField
            label="Selected JSON Path"
            value={selectedPath}
            fullWidth
            margin="dense"
            InputProps={{ 
              readOnly: true,
              endAdornment: selectedPath ? (
                <Tooltip title="Copy path">
                  <IconButton 
                    size="small" 
                    onClick={() => copyToClipboard(selectedPath, 'Path')}
                    edge="end"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null
            }}
            helperText={selectedPath ? "Path selected from JSON tree" : "Click on a path in the JSON tree to select it"}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Step 2: Select Target Field
          </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {availableTargetFields.map((field) => {
            const isMapped = Object.values(mappedFields).some(
              m => m.field === field.field && m.subField === field.subField
            );
            const isSelected = targetField?.field === field.field && targetField?.subField === field.subField;
            
            return (
              <Tooltip 
                key={`${field.field}.${field.subField}`}
                title={field.description}
                placement="right"
              >
                <Button
                  variant={isSelected ? 'contained' : isMapped ? 'outlined' : 'outlined'}
                  color={isMapped ? 'success' : 'primary'}
                  size="small"
                  sx={{ 
                    justifyContent: 'flex-start',
                    borderWidth: field.required ? 2 : 1,
                    '&:hover': {
                      backgroundColor: isMapped ? 'rgba(46, 125, 50, 0.08)' : 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                  onClick={() => onTargetFieldChange(field.field, field.subField)}
                  startIcon={isMapped ? <CheckCircleIcon /> : null}
                >
                  {field.label}
                  {field.required && <Typography variant="caption" color="error" sx={{ ml: 1 }}>*</Typography>}
                </Button>
              </Tooltip>
            );
          })}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          * Required fields must be mapped for the widget to function correctly
        </Typography>
      </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LinkIcon />}
            disabled={!selectedPath || !targetField}
            onClick={onMapField}
            sx={{ flex: 1, mr: 1 }}
          >
            Map Selected Field
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AutoFixHighIcon />}
            onClick={onAutoMap}
            sx={{ flex: 1, ml: 1 }}
          >
            Auto Map All Fields
          </Button>
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 2, mt: 3, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Current Mappings</Typography>
          {Object.entries(mappedFields).length > 0 && (
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => copyToClipboard(JSON.stringify(mappedFields, null, 2), 'All mappings')}
            >
              Copy All
            </Button>
          )}
        </Box>
        
        {Object.entries(mappedFields).length === 0 ? (
          <Alert severity="info" sx={{ mb: 1 }}>
            No fields mapped yet. Select a JSON path and target field, then click "Map Selected Field" or use "Auto Map All Fields" for automatic mapping.
          </Alert>
        ) : (
          <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
            {Object.entries(mappedFields).map(([key, mapping]) => {
              const field = availableTargetFields.find(
                f => f.field === mapping.field && f.subField === mapping.subField
              );
              const fieldLabel = field ? field.label : `${mapping.field}.${mapping.subField}`;
              const isRequired = field?.required || false;
              
              return (
                <Paper 
                  key={key} 
                  elevation={0}
                  variant="outlined"
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    borderLeft: isRequired ? '4px solid' : '1px solid',
                    borderLeftColor: isRequired ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        {fieldLabel}
                      </Typography>
                      {isRequired && (
                        <Chip size="small" label="Required" color="primary" variant="outlined" sx={{ mr: 0.5 }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {mapping.path}
                      </Typography>
                      <Tooltip title="Copy path">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(mapping.path, fieldLabel)}
                        >
                          <ContentCopyIcon fontSize="small" sx={{ width: 16, height: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Tooltip title="Remove mapping">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onRemoveMapping(mapping.field, mapping.subField)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MappingControls;
