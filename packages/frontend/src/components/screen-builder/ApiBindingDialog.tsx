import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Collapse
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ApiConfig, ApiBindingOptions, testApiConfig } from '../../services/apiBinding';
import ResponseVisualMapper from './ResponseVisualMapper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-binding-tabpanel-${index}`}
      aria-labelledby={`api-binding-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && children}
    </div>
  );
}

interface ApiBindingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (apiBinding: ApiBindingOptions) => void;
  initialApiBinding?: ApiBindingOptions;
  widgetType: string;
}

const ApiBindingDialog: React.FC<ApiBindingDialogProps> = ({
  open,
  onClose,
  onSave,
  initialApiBinding,
  widgetType
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [apiBinding, setApiBinding] = useState<ApiBindingOptions>(
    initialApiBinding || {
      apiConfig: {
        url: '',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        responseMapping: {}
      },
      loadOnRender: true,
      errorHandling: {
        showError: true
      }
    }
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMockEditor, setShowMockEditor] = useState(false);
  const [requestBodyJson, setRequestBodyJson] = useState<string>('');
  const [requestBodyError, setRequestBodyError] = useState<string>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApiConfigChange = (field: keyof ApiConfig, value: any) => {
    setApiBinding({
      ...apiBinding,
      apiConfig: {
        url: apiBinding.apiConfig?.url || '',
        method: apiBinding.apiConfig?.method || 'GET',
        ...apiBinding.apiConfig,
        [field]: value
      } as ApiConfig
    });
    
    // Initialize request body JSON when switching to POST/PUT
    if (field === 'method' && (value === 'POST' || value === 'PUT')) {
      // If there's already a body in the config, use that
      if (apiBinding.apiConfig?.body) {
        try {
          setRequestBodyJson(JSON.stringify(apiBinding.apiConfig.body, null, 2));
          setRequestBodyError('');
        } catch (e) {
          setRequestBodyJson('{}');
        }
      } else {
        // Otherwise set an empty object
        setRequestBodyJson('{}');
      }
    }
  };
  
  // Handle changes to the request body JSON
  const handleRequestBodyChange = (value: string) => {
    setRequestBodyJson(value);
    
    try {
      // Try to parse the JSON
      const parsedJson = JSON.parse(value);
      setRequestBodyError('');
      
      // Update the apiBinding with the parsed JSON
      handleApiConfigChange('body', parsedJson);
    } catch (e) {
      // If the JSON is invalid, show an error but don't update the apiBinding
      setRequestBodyError('Invalid JSON: ' + (e as Error).message);
    }
  };

  const handleResponseMappingChange = (field: string, subField: string, value: string) => {
    setApiBinding({
      ...apiBinding,
      apiConfig: {
        url: apiBinding.apiConfig?.url || '',
        method: apiBinding.apiConfig?.method || 'GET',
        ...apiBinding.apiConfig,
        responseMapping: {
          ...apiBinding.apiConfig?.responseMapping,
          [field]: {
            ...(apiBinding.apiConfig?.responseMapping?.[field as keyof typeof apiBinding.apiConfig.responseMapping] as any || {}),
            [subField]: value
          }
        }
      } as ApiConfig
    });
  };

  const handleSave = () => {
    onSave(apiBinding);
    onClose();
  };

  const detectSelectOptionsFormat = (data: any) => {
    try {
      if (!data) {
        console.log('No data provided to detectSelectOptionsFormat');
        return null;
      }
      
      console.log('Detecting select options format for data type:', typeof data);
      
      // Check if the response is a direct array
      const dataArray = Array.isArray(data) ? data : null;
      
      // If not a direct array, check common patterns like response.data
      let nestedArray = null;
      if (!dataArray && data && typeof data === 'object') {
        try {
          if (data.data && Array.isArray(data.data)) {
            nestedArray = data.data;
          }
        } catch (e) {
          console.error('Error accessing data.data property:', e);
        }
      }
      
      const arrayToCheck = dataArray || nestedArray;
      console.log('Array to check type:', arrayToCheck ? `Array with length ${arrayToCheck.length}` : 'No array found');
      
      if (!arrayToCheck || arrayToCheck.length === 0) {
        console.log('No valid array found in data');
        return null;
      }
      
      // Check the first item to see if it has id/value or similar fields
      const firstItem = arrayToCheck[0];
      if (!firstItem || typeof firstItem !== 'object' || firstItem === null) {
        console.log('First item is not a valid object');
        return null;
      }
      
      // Detect possible value and label fields
      const possibleValueFields = ['id', 'value', 'key', 'code'];
      const possibleLabelFields = ['label', 'name', 'text', 'title', 'value', 'description'];
      
      // Safe property access
      let detectedValueField: string | undefined | null = null;
      let detectedLabelField: string | undefined | null = null;
      
      try {
        detectedValueField = possibleValueFields.find(field => {
          try {
            return firstItem[field] !== undefined;
          } catch (e) {
            return false;
          }
        });
        
        detectedLabelField = possibleLabelFields.find(field => {
          try {
            return field !== detectedValueField && firstItem[field] !== undefined;
          } catch (e) {
            return false;
          }
        }) || detectedValueField; // Use value field as label if no other field found
      } catch (e) {
        console.error('Error detecting fields:', e);
      }
      
      console.log('Detected fields:', { 
        valueField: detectedValueField || 'none', 
        labelField: detectedLabelField || 'none' 
      });
      
      if (!detectedValueField) {
        console.log('No suitable value field found');
        return null;
      }
      
      return {
        path: dataArray ? '' : 'data',
        valueField: detectedValueField,
        labelField: detectedLabelField
      };
    } catch (error) {
      console.error('Error in detectSelectOptionsFormat:', error);
      return null;
    }
  };

  const handleTestApiClick = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      if (!apiBinding.apiConfig) {
        throw new Error('API configuration is missing');
      }
      const result = await testApiConfig(apiBinding.apiConfig);
      
      // Check for circular references in the result data
      let safeResultData;
      try {
        // This will throw an error if there are circular references
        if (result.data) {
          JSON.parse(JSON.stringify(result.data));
          safeResultData = result.data;
        }
      } catch (e) {
        console.error('Circular reference detected in API response:', e);
        throw new Error('The API response contains circular references which cannot be processed. Please modify the API response format.');
      }
      
      setTestResult({
        ...result,
        data: safeResultData
      });
      
      if (result.success && safeResultData) {
        // Try to auto-detect options format for select/multiselect/autocomplete widgets
        if (['select', 'multiselect', 'autocomplete'].includes(widgetType)) {
          try {
            console.log('Attempting to detect select options format...');
            const detected = detectSelectOptionsFormat(safeResultData);
            console.log('Detection result:', detected);
            
            if (detected) {
              handleResponseMappingChange('options', 'path', detected.path);
              handleResponseMappingChange('options', 'valueField', detected.valueField);
              if (detected.labelField) {
                handleResponseMappingChange('options', 'labelField', detected.labelField);
              }
              console.log(`Auto-detected select options format: valueField=${detected.valueField}, labelField=${detected.labelField || 'none'}`);
            }
          } catch (detectionError) {
            console.error('Error during options format detection:', detectionError);
          }
        }
        // For table widgets
        else if (widgetType === 'table' && Array.isArray(safeResultData)) {
          handleResponseMappingChange('tableData', 'path', '');
          console.log('Auto-detected table data array');
        }
        // For text/number fields
        else if (['textfield', 'number'].includes(widgetType)) {
          if (Array.isArray(safeResultData) && safeResultData.length > 0 && typeof safeResultData[0] === 'object') {
            // Find first value-like field
            const firstItem = safeResultData[0];
            const possibleValueFields = ['value', 'text', 'data', 'content'];
            const valueField = possibleValueFields.find(field => firstItem[field] !== undefined);
            
            if (valueField) {
              handleResponseMappingChange('value', 'path', `[0].${valueField}`);
              console.log(`Auto-detected value field: ${valueField}`);
            }
          }
        }
      }
    } catch (error: unknown) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during the API test'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponseMappingFields = () => {
    switch (widgetType) {
      case 'select':
      case 'multiselect':
      case 'autocomplete':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Options Mapping</Typography>
            <TextField
              fullWidth
              label="Options Path"
              margin="dense"
              value={apiBinding.apiConfig?.responseMapping?.options?.path || ''}
              onChange={(e) => handleResponseMappingChange('options', 'path', e.target.value)}
              helperText="JSON path to the array of options (e.g., 'data.items')"
            />
            <TextField
              fullWidth
              label="Value Field"
              margin="dense"
              value={apiBinding.apiConfig?.responseMapping?.options?.valueField || ''}
              onChange={(e) => handleResponseMappingChange('options', 'valueField', e.target.value)}
              helperText="Field to use as option value (e.g., 'id')"
            />
            <TextField
              fullWidth
              label="Label Field"
              margin="dense"
              value={apiBinding.apiConfig?.responseMapping?.options?.labelField || ''}
              onChange={(e) => handleResponseMappingChange('options', 'labelField', e.target.value)}
              helperText="Field to use as option label (e.g., 'name')"
            />
          </Box>
        );
      
      case 'text':
      case 'number':
      case 'email':
      case 'password':
      case 'textarea':
      case 'date':
      case 'datetime':
      case 'checkbox':
      case 'switch':
      case 'slider':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Value Mapping</Typography>
            <TextField
              fullWidth
              label="Value Path"
              margin="dense"
              value={apiBinding.apiConfig?.responseMapping?.value?.path || ''}
              onChange={(e) => handleResponseMappingChange('value', 'path', e.target.value)}
              helperText="JSON path to the value (e.g., 'data.value')"
            />
          </Box>
        );
      
      case 'table':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Table Data Mapping</Typography>
            <TextField
              fullWidth
              label="Rows Path"
              margin="dense"
              value={apiBinding.apiConfig?.responseMapping?.tableData?.path || ''}
              onChange={(e) => handleResponseMappingChange('tableData', 'path', e.target.value)}
              helperText="JSON path to the array of rows (e.g., 'data.rows')"
            />
            {/* Column mapping would be more complex and would need a separate component */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Column mappings can be configured in the advanced settings
            </Typography>
          </Box>
        );
      
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Response mapping not available for this widget type
          </Typography>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure API Binding</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="api binding tabs">
          <Tab label="API Configuration" id="api-binding-tab-0" aria-controls="api-binding-tabpanel-0" />
          <Tab label="Response Mapping" id="api-binding-tab-1" aria-controls="api-binding-tabpanel-1" />
          <Tab 
            label="Visual Mapper" 
            id="api-binding-tab-2" 
            aria-controls="api-binding-tabpanel-2" 
            icon={<VisibilityIcon fontSize="small" />} 
            iconPosition="start" 
          />
          <Tab label="Options" id="api-binding-tab-3" aria-controls="api-binding-tabpanel-3" />
          <Tab label="Advanced" id="api-binding-tab-4" aria-controls="api-binding-tabpanel-4" />
          <Tab label="Test" id="api-binding-tab-5" aria-controls="api-binding-tabpanel-5" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle2" gutterBottom>API Configuration</Typography>
          <TextField
            fullWidth
            label="API Endpoint URL"
            margin="dense"
            value={apiBinding.apiConfig?.url || ''}
            onChange={(e) => handleApiConfigChange('url', e.target.value)}
            placeholder="https://api.example.com/data"
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>HTTP Method</InputLabel>
            <Select
              value={apiBinding.apiConfig?.method || 'GET'}
              onChange={(e) => handleApiConfigChange('method', e.target.value)}
              label="HTTP Method"
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          
          {/* Request Body Editor - only show for POST/PUT methods */}
          <Collapse in={['POST', 'PUT'].includes(apiBinding.apiConfig?.method || 'GET')}>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Request Body
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (JSON format)
                </Typography>
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1, 
                  backgroundColor: requestBodyError ? 'rgba(255, 0, 0, 0.05)' : 'background.default'
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  value={requestBodyJson}
                  onChange={(e) => handleRequestBodyChange(e.target.value)}
                  placeholder='{"key": "value"}'
                  InputProps={{
                    style: { fontFamily: 'monospace' }
                  }}
                  error={!!requestBodyError}
                  helperText={requestBodyError || 'Enter your request body in JSON format'}
                />
              </Paper>
              
              {/* Example for the specific API */}
              {apiBinding.apiConfig?.url.includes('countriesnow.space/api/v0.1/countries/state/cities') && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Example for this API:<br />
                    <code>{JSON.stringify({
                      "country": "India",
                      "state": "Karnataka"
                    }, null, 2)}</code>
                  </Typography>
                </Alert>
              )}
            </Box>
          </Collapse>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Headers</Typography>
          <TextField
            fullWidth
            label="Content-Type"
            margin="dense"
            value={apiBinding.apiConfig?.headers?.['Content-Type'] || 'application/json'}
            onChange={(e) => handleApiConfigChange('headers', { ...apiBinding.apiConfig?.headers, 'Content-Type': e.target.value })}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={apiBinding.loadOnRender || false}
                onChange={(e) => setApiBinding({ ...apiBinding, loadOnRender: e.target.checked })}
              />
            }
            label="Load data on render"
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderResponseMappingFields()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Debug logs */}
          {testResult?.success ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    API test successful. Response data is available for mapping.
                    {Array.isArray(testResult.data) ? 
                      ` Detected array with ${testResult.data.length} items.` : 
                      testResult.data && typeof testResult.data === 'object' && testResult.data.data && Array.isArray(testResult.data.data) ? 
                      ` Detected nested array with ${testResult.data.data.length} items.` : 
                      ''}
                  </Typography>
                </Alert>
              </Box>
              
              {/* Preview of mapped data */}
              {apiBinding.apiConfig?.responseMapping?.options?.path && 
               apiBinding.apiConfig?.responseMapping?.options?.valueField && 
               apiBinding.apiConfig?.responseMapping?.options?.labelField && (
                <Box sx={{ mb: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Preview with Mapped Data</Typography>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Dropdown Preview</InputLabel>
                      <Select
                        value=""
                        label="Dropdown Preview"
                      >
                        {Array.isArray(testResult.data) ? 
                          testResult.data.map((item: any, index: number) => (
                            <MenuItem 
                              key={index} 
                              value={item[apiBinding.apiConfig?.responseMapping?.options?.valueField || '']}
                            >
                              {item[apiBinding.apiConfig?.responseMapping?.options?.labelField || '']}
                            </MenuItem>
                          )) : 
                          testResult.data?.data && Array.isArray(testResult.data.data) ? 
                            testResult.data.data.map((item: any, index: number) => (
                              <MenuItem 
                                key={index} 
                                value={item[apiBinding.apiConfig?.responseMapping?.options?.valueField || '']}
                              >
                                {item[apiBinding.apiConfig?.responseMapping?.options?.labelField || '']}
                              </MenuItem>
                            )) : 
                            <MenuItem value="">No items available</MenuItem>
                        }
                      </Select>
                    </FormControl>
                  </Paper>
                </Box>
              )}
              
              <ResponseVisualMapper
                apiResponse={testResult.data}
                widgetType={widgetType}
                currentMapping={apiBinding.apiConfig?.responseMapping}
                onMappingChange={handleResponseMappingChange}
              />
            </>
          ) : (
            <Box sx={{ p: 2 }}>
              <Alert severity="info">
                No API test results available. Run an API test first to see the visual mapper.
              </Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setTabValue(5)}
                startIcon={<PlayArrowIcon />}
                sx={{ mt: 2 }}
              >
                Go to Test Tab
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="subtitle2" gutterBottom>Request Parameters</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {'Use ${fieldName} syntax to reference form field values in your request.'}
            </Typography>
          </Box>
          
          {apiBinding.apiConfig?.method !== 'GET' && (
            <>
              <Typography variant="subtitle2" gutterBottom>Request Body</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="dense"
                value={apiBinding.apiConfig?.body ? JSON.stringify(apiBinding.apiConfig.body, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsedBody = e.target.value ? JSON.parse(e.target.value) : undefined;
                    handleApiConfigChange('body', parsedBody);
                  } catch (error) {
                    // Handle invalid JSON
                    console.error('Invalid JSON:', error);
                  }
                }}
                placeholder={'{\n  "name": "${\'fieldName\'}",\n  "email": "${\'emailField\'}"\n}'}
                InputProps={{
                  style: { fontFamily: 'monospace' }
                }}
              />
            </>
          )}
          
          {apiBinding.apiConfig?.method === 'GET' && (
            <>
              <Typography variant="subtitle2" gutterBottom>Query Parameters</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="dense"
                value={apiBinding.apiConfig?.params ? JSON.stringify(apiBinding.apiConfig.params, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsedParams = e.target.value ? JSON.parse(e.target.value) : undefined;
                    handleApiConfigChange('params', parsedParams);
                  } catch (error) {
                    // Handle invalid JSON
                    console.error('Invalid JSON:', error);
                  }
                }}
                placeholder={'{\n  "search": "${\'searchField\'}",\n  "page": 1\n}'}
                InputProps={{
                  style: { fontFamily: 'monospace' }
                }}
              />
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="subtitle2" gutterBottom>Mock Response</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={apiBinding.apiConfig?.useMock || false}
                onChange={(e) => handleApiConfigChange('useMock', e.target.checked)}
              />
            }
            label="Use mock response instead of real API call"
          />
          
          {apiBinding.apiConfig?.useMock && (
            <TextField
              fullWidth
              multiline
              rows={6}
              margin="dense"
              value={apiBinding.apiConfig?.mockResponse ? JSON.stringify(apiBinding.apiConfig.mockResponse, null, 2) : ''}
              onChange={(e) => {
                try {
                  const parsedMock = e.target.value ? JSON.parse(e.target.value) : undefined;
                  handleApiConfigChange('mockResponse', parsedMock);
                } catch (error) {
                  // Handle invalid JSON
                  console.error('Invalid JSON:', error);
                }
              }}
              InputProps={{
                style: { fontFamily: 'monospace' }
              }}
              placeholder={'{\n  "data": [\n    { "id": 1, "name": "Option 1" },\n    { "id": 2, "name": "Option 2" }\n  ]\n}'}
            />
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Error Handling</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={apiBinding.errorHandling?.showError || false}
                onChange={(e) => setApiBinding({
                  ...apiBinding, 
                  errorHandling: { 
                    showError: e.target.checked,
                    errorMessage: apiBinding.errorHandling?.errorMessage || ''
                  }
                })}
              />
            }
            label="Show error message when API call fails"
          />
          {apiBinding.errorHandling?.showError && (
            <TextField
              fullWidth
              label="Custom Error Message"
              margin="dense"
              value={apiBinding.errorHandling?.errorMessage || ''}
              onChange={(e) => setApiBinding({
                ...apiBinding,
                errorHandling: {
                  showError: true,
                  errorMessage: e.target.value
                }
              })}
              placeholder="Failed to load data. Please try again later."
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTestApiClick}
              startIcon={<PlayArrowIcon />}
              disabled={isLoading || !apiBinding.apiConfig?.url}
            >
              {isLoading ? 'Testing...' : 'Test API'}
            </Button>
          </Box>
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          
          {testResult && (
            <Box>
              {testResult.success ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  API test successful!
                </Alert>
              ) : (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {testResult.error || 'API test failed'}
                </Alert>
              )}
              
              <Typography variant="subtitle2" gutterBottom>Raw Response:</Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  maxHeight: '200px', 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {JSON.stringify(testResult.data, null, 2)}
              </Paper>
              
              {testResult.success && apiBinding.apiConfig?.responseMapping && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Processed Data:</Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      maxHeight: '200px', 
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {JSON.stringify(testResult.processedData, null, 2)}
                  </Paper>
                </>
              )}
            </Box>
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiBindingDialog;
