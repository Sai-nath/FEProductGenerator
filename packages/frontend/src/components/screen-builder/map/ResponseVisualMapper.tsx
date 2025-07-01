import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { getValueByPath } from '../../../services/apiBinding';
import JsonPathTree from './JsonPathTree';
import WidgetPreview from './WidgetPreview';
import MappingControls from './MappingControls';

interface ResponseVisualMapperProps {
  apiResponse: any;
  widgetType: string;
  currentMapping: any;
  onMappingChange: (field: string, subField: string, value: string) => void;
}

const ResponseVisualMapper: React.FC<ResponseVisualMapperProps> = ({
  apiResponse,
  widgetType,
  currentMapping,
  onMappingChange
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [targetField, setTargetField] = useState<{ field: string; subField: string } | null>(null);
  const [jsonPaths, setJsonPaths] = useState<string[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, { path: string; field: string; subField: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Extract JSON paths from the API response
  useEffect(() => {
    if (!apiResponse) return;

    // Initialize mappedFields from currentMapping
    const initialMappedFields: Record<string, { path: string; field: string; subField: string }> = {};
    
    if (currentMapping) {
      if (['select', 'multiselect', 'autocomplete'].includes(widgetType)) {
        if (currentMapping.options?.path) {
          initialMappedFields['options.path'] = {
            path: currentMapping.options.path,
            field: 'options',
            subField: 'path'
          };
        }
        if (currentMapping.options?.valueField) {
          initialMappedFields['options.valueField'] = {
            path: currentMapping.options.valueField,
            field: 'options',
            subField: 'valueField'
          };
        }
        if (currentMapping.options?.labelField) {
          initialMappedFields['options.labelField'] = {
            path: currentMapping.options.labelField,
            field: 'options',
            subField: 'labelField'
          };
        }
      } else if (widgetType === 'table') {
        if (currentMapping.tableData?.path) {
          initialMappedFields['tableData.path'] = {
            path: currentMapping.tableData.path,
            field: 'tableData',
            subField: 'path'
          };
        }
      } else {
        if (currentMapping.value?.path) {
          initialMappedFields['value.path'] = {
            path: currentMapping.value.path,
            field: 'value',
            subField: 'path'
          };
        }
      }
    }
    
    setMappedFields(initialMappedFields);
    
    // Extract paths from the API response
    const extractedPaths = extractJsonPaths(apiResponse);
    setJsonPaths(extractedPaths);
  }, [apiResponse, currentMapping, widgetType]);

  // Extract all paths from a JSON object
  const extractJsonPaths = (obj: any, parentPath: string = '', paths: string[] = [], visited = new Set()): string[] => {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) {
      return paths;
    }
    
    // Add object to visited set to prevent circular references
    visited.add(obj);
    
    if (Array.isArray(obj)) {
      // For arrays, we only need to process the first item to get the structure
      if (obj.length > 0) {
        // Add the array path itself
        if (parentPath) {
          paths.push(parentPath);
        }
        
        // Process the first item to get its structure
        if (typeof obj[0] === 'object' && obj[0] !== null) {
          extractJsonPaths(obj[0], parentPath, paths, visited);
        }
      }
    } else {
      // For objects, process each property
      Object.keys(obj).forEach(key => {
        const newPath = parentPath ? `${parentPath}.${key}` : key;
        paths.push(newPath);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractJsonPaths(obj[key], newPath, paths, visited);
        }
      });
    }
    
    return paths;
  };

  // Toggle expansion of a path in the JSON tree
  const handleTogglePathExpansion = (path: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Handle selection of a path in the JSON tree
  const handlePathSelect = (path: string) => {
    setSelectedPath(path);
  };

  // Handle selection of a target field
  const handleTargetFieldChange = (field: string, subField: string) => {
    setTargetField({ field, subField });
  };

  // Map the selected path to the selected target field
  const handleMapField = () => {
    if (!selectedPath || !targetField) return;
    
    const { field, subField } = targetField;
    const key = `${field}.${subField}`;
    
    // Validate the path exists in the API response
    try {
      const value = getValueByPath(apiResponse, selectedPath);
      if (value === undefined) {
        console.warn(`Warning: Path ${selectedPath} does not exist in the API response`);
        setSaveMessage(`Warning: Path ${selectedPath} may not exist in all responses`);
      } else {
        setSaveMessage(`Successfully mapped ${field}.${subField} to ${selectedPath}`);
      }
    } catch (error) {
      console.error(`Error validating path ${selectedPath}:`, error);
      setSaveMessage(`Error validating path ${selectedPath}`);
    }
    
    // Update mappedFields state
    setMappedFields(prev => ({
      ...prev,
      [key]: { path: selectedPath, field, subField }
    }));
    
    // Call the onMappingChange callback
    onMappingChange(field, subField, selectedPath);
    
    // Show success notification
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // Clear selection after mapping for better UX
    setSelectedPath('');
  };

  // Remove a mapping
  const handleRemoveMapping = (field: string, subField: string) => {
    const key = `${field}.${subField}`;
    
    // Update mappedFields state
    setMappedFields(prev => {
      const newMappedFields = { ...prev };
      delete newMappedFields[key];
      return newMappedFields;
    });
    
    // Call the onMappingChange callback with empty value to remove the mapping
    onMappingChange(field, subField, '');
  };

  // Helper function to find array paths in the API response
  const findArrayPaths = (obj: any, parentPath: string = '', paths: string[] = [], visited = new Set()): string[] => {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) {
      return paths;
    }
    
    visited.add(obj);
    
    if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
      paths.push(parentPath);
    }
    
    if (!Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        const newPath = parentPath ? `${parentPath}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findArrayPaths(obj[key], newPath, paths, visited);
        }
      });
    }
    
    return paths;
  };

  // Helper function to find paths to primitive values in the API response
  const findValuePaths = (obj: any, parentPath: string = '', paths: string[] = [], visited = new Set()): string[] => {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) {
      return paths;
    }
    
    visited.add(obj);
    
    if (!Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newPath = parentPath ? `${parentPath}.${key}` : key;
        
        if (typeof value !== 'object' || value === null) {
          paths.push(newPath);
        } else {
          findValuePaths(value, newPath, paths, visited);
        }
      });
    }
    
    return paths;
  };

  // Auto-map fields based on widget type and API response structure
  const handleAutoMap = () => {
    if (!apiResponse || !jsonPaths.length) {
      setSaveMessage('No API response or paths available for auto-mapping');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }
    
    console.log('Auto-mapping for widget type:', widgetType);
    setSaveMessage(`Auto-mapping fields for ${widgetType} widget...`);
    
    const newMappedFields: Record<string, { path: string; field: string; subField: string }> = {};
    
    if (['select', 'multiselect', 'autocomplete'].includes(widgetType)) {
      // Find array paths for dropdown options
      const arrayPaths = findArrayPaths(apiResponse);
      if (arrayPaths.length > 0) {
        // Use the first array path as options path
        const optionsPath = arrayPaths[0];
        newMappedFields['options.path'] = {
          path: optionsPath,
          field: 'options',
          subField: 'path'
        };
        
        // Try to find id/value field in the first item of the array
        const firstItem = getValueByPath(apiResponse, optionsPath)?.[0];
        
        if (firstItem && typeof firstItem === 'object') {
          const keys = Object.keys(firstItem);
          
          // Look for common id/value field names
          const valueFieldCandidates = ['id', 'value', 'key', 'code', 'uid'];
          let valueField = keys.find(key => valueFieldCandidates.includes(key.toLowerCase()));
          
          // If no exact match, look for keys containing these terms
          if (!valueField) {
            valueField = keys.find(key => 
              valueFieldCandidates.some(candidate => 
                key.toLowerCase().includes(candidate.toLowerCase())
              )
            );
          }
          
          // If still no match, use the first key that's not a complex object
          if (!valueField && keys.length > 0) {
            valueField = keys.find(key => 
              typeof firstItem[key] !== 'object' || firstItem[key] === null
            );
          }
          
          if (valueField) {
            newMappedFields['options.valueField'] = {
              path: valueField,
              field: 'options',
              subField: 'valueField'
            };
          }
          
          // Look for common label field names
          const labelFieldCandidates = ['name', 'label', 'title', 'text', 'description', 'display'];
          let labelField = keys.find(key => labelFieldCandidates.includes(key.toLowerCase()));
          
          // If no exact match, look for keys containing these terms
          if (!labelField) {
            labelField = keys.find(key => 
              labelFieldCandidates.some(candidate => 
                key.toLowerCase().includes(candidate.toLowerCase())
              )
            );
          }
          
          // If still no match and we have a value field, use a different field than value
          if (!labelField && valueField && keys.length > 1) {
            labelField = keys.find(key => 
              key !== valueField && 
              (typeof firstItem[key] !== 'object' || firstItem[key] === null)
            );
          }
          
          if (labelField) {
            newMappedFields['options.labelField'] = {
              path: labelField,
              field: 'options',
              subField: 'labelField'
            };
          }
        }
      }
    } else if (widgetType === 'table') {
      // Find array paths that might contain table data
      const tableArrayPaths = findArrayPaths(apiResponse);
      if (tableArrayPaths.length > 0) {
        // Use the first array path as table data path
        const tableDataPath = tableArrayPaths[0];
        newMappedFields['tableData.path'] = {
          path: tableDataPath,
          field: 'tableData',
          subField: 'path'
        };
      }
    } else {
      // For text/number widgets, find a suitable value path
      const valuePaths = findValuePaths(apiResponse);
      if (valuePaths.length > 0) {
        // Use the first value path
        const valuePath = valuePaths[0];
        newMappedFields['value.path'] = {
          path: valuePath,
          field: 'value',
          subField: 'path'
        };
      }
    }
    
    // Update mappedFields state
    setMappedFields(newMappedFields);
    
    // Call onMappingChange for each mapped field
    Object.entries(newMappedFields).forEach(([key, mapping]) => {
      onMappingChange(mapping.field, mapping.subField, mapping.path);
    });
    
    // Provide feedback on the mapping results
    const mappedCount = Object.keys(newMappedFields).length;
    if (mappedCount > 0) {
      setSaveMessage(`Successfully auto-mapped ${mappedCount} field${mappedCount > 1 ? 's' : ''}`);
    } else {
      setSaveMessage('Could not auto-map any fields. Try selecting fields manually.');
    }
    
    // Show success notification
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Render a preview of a path value
  const renderPathValue = (path: string) => {
    const value = getValueByPath(apiResponse, path);
    
    if (value === undefined || value === null) {
      return 'null';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `Array[${value.length}]`;
      }
      return 'Object';
    }
    
    return String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSaveSuccess(false)} 
          severity={saveMessage.includes('Warning') || saveMessage.includes('Error') ? 'warning' : 'success'}
          sx={{ width: '100%' }}
        >
          {saveMessage}
        </Alert>
      </Snackbar>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Response Visual Mapper
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Map JSON paths from your API response to widget fields for dynamic data binding
          </Typography>
        </Typography>

        {!apiResponse ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No API response data available. Please fetch data from an API endpoint first.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* JSON Path Tree */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    API Response Structure
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click on a path to select it
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1, 
                      height: '450px', 
                      overflow: 'auto',
                      bgcolor: 'background.default'
                    }}
                  >
                    {jsonPaths.length > 0 ? (
                      <JsonPathTree
                        jsonPaths={jsonPaths}
                        expandedPaths={expandedPaths}
                        mappedFields={mappedFields}
                        selectedPath={selectedPath}
                        onTogglePathExpansion={handleTogglePathExpansion}
                        onPathSelect={handlePathSelect}
                        renderPathValue={renderPathValue}
                      />
                    ) : (
                      <Alert severity="info">
                        No paths found in the API response. The response may be empty or invalid.
                      </Alert>
                    )}
                  </Paper>
                </Box>
              </Paper>
            </Grid>
            
            {/* Mapping Controls and Preview */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <MappingControls
                  widgetType={widgetType}
                  selectedPath={selectedPath}
                  targetField={targetField}
                  mappedFields={mappedFields}
                  onTargetFieldChange={handleTargetFieldChange}
                  onMapField={handleMapField}
                  onRemoveMapping={handleRemoveMapping}
                  onAutoMap={handleAutoMap}
                />
                
                <Paper 
                  elevation={0} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 2, 
                    borderRadius: 2,
                    flexGrow: 1,
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Widget Preview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WidgetPreview
                      widgetType={widgetType}
                      currentMapping={currentMapping}
                      apiResponse={apiResponse}
                    />
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default ResponseVisualMapper;
