import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
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
import { ApiBindingOptions, testApiConfig } from '../../services/apiBinding';
import ResponseVisualMapper from './ResponseVisualMapper';

// Mock data for testing
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: true },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'guest', active: false }
];

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

const ApiBindingVisualMapperDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [apiUrl, setApiUrl] = useState('https://api.example.com/users');
  const [apiMethod, setApiMethod] = useState('GET');
  const [useMock, setUseMock] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const [apiBinding, setApiBinding] = useState<ApiBindingOptions>({
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testApiConfig({
        url: apiUrl,
        method: apiMethod as 'GET' | 'POST' | 'PUT' | 'DELETE',
        useMock,
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

  const handleResponseMappingChange = (field: string, subField: string, value: string) => {
    setApiBinding({
      ...apiBinding,
      apiConfig: {
        ...apiBinding.apiConfig!,
        responseMapping: {
          ...apiBinding.apiConfig?.responseMapping,
          [field]: {
            ...(apiBinding.apiConfig?.responseMapping?.[field as keyof typeof apiBinding.apiConfig.responseMapping] as any || {}),
            [subField]: value
          }
        }
      }
    });
  };

  const applyMappingToTable = () => {
    // In a real application, this would update the table widget with the new mapping
    alert('Mapping applied to table widget!');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Visual API Response Mapper Demo
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="API Endpoint URL"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/data"
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTestApi}
              startIcon={isTesting ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              disabled={isTesting}
              fullWidth
              sx={{ height: '56px' }}
            >
              {isTesting ? 'Testing...' : 'Test API'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Visual Response Mapper" 
              subheader="Map API response data to UI components visually"
            />
            <Divider />
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="api binding tabs">
                <Tab 
                  label="Visual Mapper" 
                  id="api-binding-tab-0" 
                  aria-controls="api-binding-tabpanel-0" 
                  icon={<VisibilityIcon fontSize="small" />} 
                  iconPosition="start" 
                />
                <Tab 
                  label="Raw Response" 
                  id="api-binding-tab-1" 
                  aria-controls="api-binding-tabpanel-1" 
                  icon={<CodeIcon fontSize="small" />} 
                  iconPosition="start" 
                />
                <Tab 
                  label="Preview" 
                  id="api-binding-tab-2" 
                  aria-controls="api-binding-tabpanel-2" 
                />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                {testResult?.success ? (
                  <Box>
                    <ResponseVisualMapper
                      apiResponse={testResult.data}
                      widgetType="table"
                      currentMapping={apiBinding.apiConfig?.responseMapping}
                      onMappingChange={handleResponseMappingChange}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={applyMappingToTable}
                      >
                        Apply Mapping to Table
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Alert severity="info">
                      Please test the API first to visualize and map the response data.
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
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Table Widget Preview
                </Typography>
                <TableWidget
                  id="users-table-preview"
                  columns={tableColumns}
                  allowAddRows={true}
                  allowDeleteRows={true}
                  showRowNumbers={true}
                  showTotals={false}
                  apiBinding={apiBinding}
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Mapping Configuration:
        </Typography>
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
          {JSON.stringify(apiBinding.apiConfig?.responseMapping, null, 2)}
        </Paper>
      </Box>
    </Box>
  );
};

export default ApiBindingVisualMapperDemo;
