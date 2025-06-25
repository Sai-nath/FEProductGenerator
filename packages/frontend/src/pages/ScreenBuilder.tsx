import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { screenConfigurationApi } from '../services/api';
import { 
  ScreenConfiguration, 
  Accordion as AccordionType,
  Section,
  Widget
} from '@screen-builder/common';

// Local implementation of WidgetType enum to avoid ESM/CommonJS issues
enum WidgetType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  DATETIME = 'datetime',
  TEXTAREA = 'textarea',
  TABLE = 'table',
  CUSTOM = 'custom',
  SWITCH = 'switch',
  SLIDER = 'slider',
  AUTOCOMPLETE = 'autocomplete',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  DIVIDER = 'divider'
}

// Local implementation of generateId function to avoid ESM/CommonJS issues
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
import WidgetEditor from '../components/screen-builder/WidgetEditor';
import WidgetPreview from '../components/screen-builder/WidgetPreview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`screen-builder-tabpanel-${index}`}
      aria-labelledby={`screen-builder-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ScreenBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screenConfig, setScreenConfig] = useState<ScreenConfiguration | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (id) {
      fetchScreenConfig();
    } else {
      navigate('/screen-configurations');
    }
  }, [id]);

  const fetchScreenConfig = async () => {
    try {
      setLoading(true);
      const data = await screenConfigurationApi.getById(id!);
      setScreenConfig(data);
    } catch (error) {
      console.error('Error fetching screen configuration:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load screen configuration',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    if (!screenConfig) return;
    
    try {
      setSaving(true);
      await screenConfigurationApi.update(screenConfig.id, screenConfig);
      setSnackbar({
        open: true,
        message: 'Screen configuration saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving screen configuration:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save screen configuration',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBackToList = () => {
    navigate('/screen-configurations');
  };

  // Accordion management
  const addAccordion = () => {
    if (!screenConfig) return;
    
    const newAccordion: AccordionType = {
      id: generateId(),
      title: 'New Accordion',
      isOpen: true,
      sections: []
    };
    
    const updatedConfig = {
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: [...screenConfig.config.accordions, newAccordion]
      }
    };
    
    setScreenConfig(updatedConfig);
  };

  const updateAccordion = (accordionId: string, updates: Partial<AccordionType>) => {
    if (!screenConfig) return;
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => 
      accordion.id === accordionId ? { ...accordion, ...updates } : accordion
    );
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  const deleteAccordion = (accordionId: string) => {
    if (!screenConfig) return;
    
    const updatedAccordions = screenConfig.config.accordions.filter(
      accordion => accordion.id !== accordionId
    );
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  // Section management
  const addSection = (accordionId: string) => {
    if (!screenConfig) return;
    
    const newSection: Section = {
      id: generateId(),
      title: 'New Section',
      columns: 2,
      widgets: []
    };
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => {
      if (accordion.id === accordionId) {
        return {
          ...accordion,
          sections: [...accordion.sections, newSection]
        };
      }
      return accordion;
    });
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  const updateSection = (accordionId: string, sectionId: string, updates: Partial<Section>) => {
    if (!screenConfig) return;
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => {
      if (accordion.id === accordionId) {
        const updatedSections = accordion.sections.map(section => 
          section.id === sectionId ? { ...section, ...updates } : section
        );
        
        return {
          ...accordion,
          sections: updatedSections
        };
      }
      return accordion;
    });
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  const deleteSection = (accordionId: string, sectionId: string) => {
    if (!screenConfig) return;
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => {
      if (accordion.id === accordionId) {
        return {
          ...accordion,
          sections: accordion.sections.filter(section => section.id !== sectionId)
        };
      }
      return accordion;
    });
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  // Widget management
  const addWidget = (accordionId: string, sectionId: string, widgetType: WidgetType) => {
    if (!screenConfig) return;
    
    const newWidget: Widget = {
      id: generateId(),
      type: widgetType,
      label: `New ${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}`,
      field: `field_${generateId().substring(0, 8)}`,
      required: false,
      disabled: false,
      hidden: false
    };
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => {
      if (accordion.id === accordionId) {
        const updatedSections = accordion.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              widgets: [...section.widgets, newWidget]
            };
          }
          return section;
        });
        
        return {
          ...accordion,
          sections: updatedSections
        };
      }
      return accordion;
    });
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  const updateWidget = (accordionId: string, sectionId: string, widgetId: string, updates: Partial<Widget>) => {
    if (!screenConfig) return;
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => {
      if (accordion.id === accordionId) {
        const updatedSections = accordion.sections.map(section => {
          if (section.id === sectionId) {
            const updatedWidgets = section.widgets.map(widget => 
              widget.id === widgetId ? { ...widget, ...updates } : widget
            );
            
            return {
              ...section,
              widgets: updatedWidgets
            };
          }
          return section;
        });
        
        return {
          ...accordion,
          sections: updatedSections
        };
      }
      return accordion;
    });
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };

  const deleteWidget = (accordionId: string, sectionId: string, widgetId: string) => {
    if (!screenConfig) return;
    
    const updatedAccordions = screenConfig.config.accordions.map(accordion => {
      if (accordion.id === accordionId) {
        const updatedSections = accordion.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              widgets: section.widgets.filter(widget => widget.id !== widgetId)
            };
          }
          return section;
        });
        
        return {
          ...accordion,
          sections: updatedSections
        };
      }
      return accordion;
    });
    
    setScreenConfig({
      ...screenConfig,
      config: {
        ...screenConfig.config,
        accordions: updatedAccordions
      }
    });
  };
  
  // Helper function to get all widgets from all accordions and sections
  const getAllWidgets = () => {
    if (!screenConfig) return [];
    
    const allWidgets: Widget[] = [];
    
    screenConfig.config.accordions.forEach(accordion => {
      accordion.sections.forEach(section => {
        section.widgets.forEach(widget => {
          allWidgets.push(widget);
        });
      });
    });
    
    return allWidgets;
  };
  
  // Handle form value changes for dependency management
  const handleFormValueChange = (field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!screenConfig) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Screen configuration not found</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mt: 2 }}
        >
          Back to Screen Configurations
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBackToList}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ ml: 1 }}>
            {screenConfig.screenName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
      
      <Paper sx={{ height: 'calc(100% - 60px)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="screen builder tabs">
            <Tab label="Builder" />
            <Tab label="Preview" />
            <Tab label="JSON" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addAccordion}
              >
                Add Accordion
              </Button>
            </Box>
            
            {screenConfig.config.accordions.length === 0 ? (
              <Alert severity="info">
                No accordions found. Click "Add Accordion" to start building your screen.
              </Alert>
            ) : (
              screenConfig.config.accordions.map((accordion) => (
                <Paper key={accordion.id} sx={{ mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DragIndicatorIcon sx={{ mr: 1 }} />
                      <TextField
                        value={accordion.title}
                        onChange={(e) => updateAccordion(accordion.id, { title: e.target.value })}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          style: { color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }
                        }}
                      />
                    </Box>
                    <Box>
                      <Tooltip title="Delete Accordion">
                        <IconButton 
                          size="small" 
                          onClick={() => deleteAccordion(accordion.id)}
                          sx={{ color: 'white' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ p: 2 }}>
                    {accordion.sections.map((section) => (
                      <Paper key={section.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <TextField
                              value={section.title}
                              onChange={(e) => updateSection(accordion.id, section.id, { title: e.target.value })}
                              variant="standard"
                              label="Section Title"
                            />
                          </Box>
                          <Box>
                            <TextField
                              type="number"
                              label="Columns"
                              value={section.columns}
                              onChange={(e) => updateSection(accordion.id, section.id, { columns: parseInt(e.target.value) || 1 })}
                              InputProps={{ inputProps: { min: 1, max: 4 } }}
                              variant="standard"
                              sx={{ width: 80, mr: 2 }}
                            />
                            <Tooltip title="Delete Section">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => deleteSection(accordion.id, section.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {section.widgets.map((widget) => (
                            <Grid item xs={12} sm={12 / section.columns} key={widget.id}>
                              <WidgetEditor
                                widget={widget}
                                onUpdate={(updates) => updateWidget(accordion.id, section.id, widget.id, updates)}
                                onDelete={() => deleteWidget(accordion.id, section.id, widget.id)}
                                allWidgets={getAllWidgets()}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => addWidget(accordion.id, section.id, WidgetType.TEXT)}
                          >
                            Add Widget
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addSection(accordion.id)}
                    >
                      Add Section
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {screenConfig.config.accordions.map((accordion) => (
              <Accordion key={accordion.id} defaultExpanded={accordion.isOpen}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{accordion.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {accordion.sections.map((section) => (
                    <Box key={section.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {section.title}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        {section.widgets.map((widget) => (
                          <Grid item xs={12} sm={12 / section.columns} key={widget.id}>
                            <WidgetPreview 
                              widget={widget} 
                              allWidgets={getAllWidgets()} 
                              formValues={formValues}
                              onValueChange={handleFormValueChange}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <pre style={{ overflow: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                {JSON.stringify(screenConfig.config, null, 2)}
              </pre>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScreenBuilder;
