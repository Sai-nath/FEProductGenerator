import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WidgetPreview from './WidgetPreview';

// Local type definitions to avoid ESM/CommonJS issues
interface Widget {
  id: string;
  type: string;
  label: string;
  field: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  width?: string;
  dependency?: {
    parentFieldId: string;
    condition: string;
    value: any;
    action: string;
  };
}

interface Section {
  id: string;
  title: string;
  columns: number;
  widgets: Widget[];
}

interface Accordion {
  id: string;
  title: string;
  isOpen: boolean;
  sections: Section[];
}

interface ScreenConfig {
  accordions: Accordion[];
}

interface FormRendererProps {
  config: ScreenConfig;
  initialValues?: Record<string, any>;
  onValueChange?: (values: Record<string, any>) => void;
  readOnly?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  initialValues = {},
  onValueChange,
  readOnly = false
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});

  // Initialize expanded accordions based on isOpen property
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    config.accordions.forEach(accordion => {
      initialExpandedState[accordion.id] = accordion.isOpen;
    });
    setExpandedAccordions(initialExpandedState);
  }, [config]);

  // Get all widgets from all accordions and sections
  const getAllWidgets = () => {
    const allWidgets: Widget[] = [];
    
    config.accordions.forEach(accordion => {
      accordion.sections.forEach(section => {
        section.widgets.forEach(widget => {
          allWidgets.push(widget);
        });
      });
    });
    
    return allWidgets;
  };
  
  // Cache all widgets for dependency evaluation
  const allWidgets = getAllWidgets();

  // Handle form value changes
  const handleFormValueChange = (field: string, value: any) => {
    const newValues = {
      ...formValues,
      [field]: value
    };
    
    setFormValues(newValues);
    
    if (onValueChange) {
      onValueChange(newValues);
    }
  };

  // Handle accordion expansion
  const handleAccordionChange = (accordionId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions({
      ...expandedAccordions,
      [accordionId]: isExpanded
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {config.accordions.map(accordion => (
        <Accordion 
          key={accordion.id}
          expanded={expandedAccordions[accordion.id] || false}
          onChange={handleAccordionChange(accordion.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{accordion.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {accordion.sections.map(section => (
              <Paper key={section.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {section.title}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${section.columns}, 1fr)`, gap: 2 }}>
                  {/* Filter out widgets that would be hidden by dependency rules */}
                  {section.widgets.map(widget => {
                    // Check if this widget would be hidden by a dependency
                    let shouldBeHidden = false;
                    if (widget.dependency) {
                      const { parentFieldId, condition, value: targetValue, action } = widget.dependency;
                      const parentValue = formValues[parentFieldId];
                      
                      let conditionMet = false;
                      switch (condition) {
                        case 'equals':
                          conditionMet = String(parentValue) === String(targetValue);
                          break;
                        case 'notEquals':
                          conditionMet = String(parentValue) !== String(targetValue);
                          break;
                        // Add other conditions as needed
                        default:
                          conditionMet = false;
                      }
                      
                      if (action === 'show') {
                        shouldBeHidden = !conditionMet;
                      } else if (action === 'hide') {
                        shouldBeHidden = conditionMet;
                      }
                    }
                    
                    // Skip rendering this widget container if it should be hidden
                    if (shouldBeHidden || widget.hidden) {
                      return null;
                    }
                    
                    return (
                      <Box 
                        key={widget.id} 
                        sx={{ 
                          padding: 1
                        }}
                      >
                        <WidgetPreview
                          widget={widget}
                          allWidgets={allWidgets}
                          formValues={formValues}
                          onValueChange={handleFormValueChange}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FormRenderer;
