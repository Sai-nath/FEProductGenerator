import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import TableWidget from './TableWidget';
import ApiBindingButton from './ApiBindingButton';
import { ApiBindingOptions, testApiConfig } from '../../services/apiBinding';
import ResponseVisualMapper from './ResponseVisualMapper';

// Example widget configurations
const tableColumns = [
  { id: 'id', header: 'ID', type: 'text' as const, editable: false },
  { id: 'name', header: 'Name', type: 'text' as const, editable: true },
  { id: 'email', header: 'Email', type: 'text' as const, editable: true },
  { id: 'role', header: 'Role', type: 'select' as const, editable: true, options: [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
    { value: 'guest', label: 'Guest' }
  ]},
  { id: 'active', header: 'Active', type: 'checkbox' as const, editable: true }
];

// Mock data for testing
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: true },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'guest', active: false }
];

const mockCountries = [
  { id: '1', name: 'United States' },
  { id: '2', name: 'Canada' },
  { id: '3', name: 'United Kingdom' },
  { id: '4', name: 'Australia' },
  { id: '5', name: 'Germany' },
  { id: '6', name: 'France' },
  { id: '7', name: 'Japan' },
  { id: '8', name: 'China' },
  { id: '9', name: 'India' },
  { id: '10', name: 'Brazil' }
];

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

const ApiBindingExample: React.FC = () => {
  // State for form values (used for template variables in API calls)
  const [formValues, setFormValues] = useState<Record<string, any>>({
    userId: '1',
    searchTerm: ''
  });
  
  // State for visual mapper demo
  const [tabValue, setTabValue] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // State for API bindings for each widget
  const [tableApiBinding, setTableApiBinding] = useState<ApiBindingOptions>({
    apiConfig: {
      url: 'https://api.example.com/users',
      method: 'GET',
      useMock: true,
      mockResponse: { users: mockUsers },
      responseMapping: {
        tableData: {
          path: 'users',
          columns: {
            id: 'id',
            name: 'name',
            email: 'email',
            role: 'role',
            active: 'active'
          }
        }
      }
    },
    loadOnRender: true,
    errorHandling: {
      showError: true
    }
  });

  const [dropdownApiBinding, setDropdownApiBinding] = useState<ApiBindingOptions>({
    apiConfig: {
      url: 'https://api.example.com/countries',
      method: 'GET',
      useMock: true,
      mockResponse: { countries: mockCountries },
      responseMapping: {
        options: {
          path: 'countries',
          valueField: 'id',
          labelField: 'name'
        }
      }
    },
    loadOnRender: true
  });

  const [textFieldApiBinding, setTextFieldApiBinding] = useState<ApiBindingOptions>({
    apiConfig: {
      url: 'https://api.example.com/users/${userId}',
      method: 'GET',
      useMock: true,
      mockResponse: mockUsers[0],
      responseMapping: {
        value: {
          path: 'name'
        }
      }
    },
    loadOnRender: true
  });

  // State for widget values
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [dropdownOptions, setDropdownOptions] = useState<Array<{value: string, label: string}>>([]);

  // Handle form value changes
  const handleFormValueChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };
  
  // Handle tab change for visual mapper
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle API test for visual mapper
  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testApiConfig({
        url: 'https://api.example.com/users',
        method: 'GET',
        useMock: true,
        mockResponse: { users: mockUsers }
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Handle response mapping change
  const handleResponseMappingChange = (field: string, subField: string, value: string) => {
    setTableApiBinding({
      ...tableApiBinding,
      apiConfig: {
        ...tableApiBinding.apiConfig!,
        responseMapping: {
          ...tableApiBinding.apiConfig?.responseMapping,
          [field]: {
            ...(tableApiBinding.apiConfig?.responseMapping?.[field as keyof typeof tableApiBinding.apiConfig.responseMapping] as any || {}),
            [subField]: value
          }
        }
      }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Binding Example
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Form Values (Used as Template Variables)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="User ID"
              value={formValues.userId}
              onChange={(e) => handleFormValueChange('userId', e.target.value)}
              helperText="Used in API calls with ${userId} template"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Search Term"
              value={formValues.searchTerm}
              onChange={(e) => handleFormValueChange('searchTerm', e.target.value)}
              helperText="Used in API calls with ${searchTerm} template"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Table Widget with API Binding */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Table Widget with API Binding" 
              action={
                <ApiBindingButton
                  widgetType="table"
                  initialApiBinding={tableApiBinding}
                  onSave={setTableApiBinding}
                />
              }
            />
            <Divider />
            <CardContent>
              <TableWidget
                id="users-table"
                columns={tableColumns}
                allowAddRows={true}
                allowDeleteRows={true}
                showRowNumbers={true}
                showTotals={false}
                apiBinding={tableApiBinding}
                formValues={formValues}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Dropdown with API Binding */}
        <Grid item xs={6}>
          <Card>
            <CardHeader 
              title="Dropdown with API Binding" 
              action={
                <ApiBindingButton
                  widgetType="select"
                  initialApiBinding={dropdownApiBinding}
                  onSave={setDropdownApiBinding}
                />
              }
            />
            <Divider />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="country-select-label">Country</InputLabel>
                <Select
                  labelId="country-select-label"
                  value={selectedCountry}
                  label="Country"
                  onChange={(e) => setSelectedCountry(e.target.value as string)}
                >
                  {mockCountries.map(country => (
                    <MenuItem key={country.id} value={country.id}>{country.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Note: In a real implementation, the options would be populated from the API response
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Text Field with API Binding */}
        <Grid item xs={6}>
          <Card>
            <CardHeader 
              title="Text Field with API Binding" 
              action={
                <ApiBindingButton
                  widgetType="text"
                  initialApiBinding={textFieldApiBinding}
                  onSave={setTextFieldApiBinding}
                />
              }
            />
            <Divider />
            <CardContent>
              <TextField
                fullWidth
                label="User Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Note: In a real implementation, this would be populated from the API response based on userId
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => {
                  // Simulate API call result
                  const user = mockUsers.find(u => u.id === formValues.userId);
                  if (user) {
                    setUserName(user.name);
                  }
                }}
              >
                Simulate API Load
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Visual Response Mapper Demo Section */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Visual Response Mapper Demo
          </Typography>
          <Card>
            <CardHeader 
              title="Enhanced API Binding with Visual Mapper" 
              subheader="Map API response data to UI components visually"
              action={
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTestApi}
                  startIcon={isTesting ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  disabled={isTesting}
                >
                  {isTesting ? 'Testing...' : 'Test API'}
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="api binding tabs">
                <Tab 
                  label="Visual Mapper" 
                  id="visual-mapper-tab-0" 
                  aria-controls="visual-mapper-tabpanel-0" 
                  icon={<VisibilityIcon fontSize="small" />} 
                  iconPosition="start" 
                />
                <Tab 
                  label="Raw Response" 
                  id="visual-mapper-tab-1" 
                  aria-controls="visual-mapper-tabpanel-1" 
                  icon={<CodeIcon fontSize="small" />} 
                  iconPosition="start" 
                />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                {testResult?.success ? (
                  <Box>
                    <ResponseVisualMapper
                      apiResponse={testResult.data}
                      widgetType="table"
                      currentMapping={tableApiBinding.apiConfig?.responseMapping}
                      onMappingChange={handleResponseMappingChange}
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Alert severity="info">
                      Click the "Test API" button above to visualize and map the response data.
                    </Alert>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                {testResult?.success ? (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      maxHeight: '400px', 
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {JSON.stringify(testResult.data, null, 2)}
                  </Paper>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Alert severity="info">
                      No API response available. Test the API first to see the raw response.
                    </Alert>
                  </Box>
                )}
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApiBindingExample;
