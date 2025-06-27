import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Widget, SelectOption, WidgetDependency, TableColumn } from '@screen-builder/common';
import DependencyEditor from './DependencyEditor';
import TableWidgetConfig from './TableWidgetConfig';

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

interface WidgetEditorProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
  onDelete: () => void;
  allWidgets?: Widget[];
}

const WidgetEditor = ({ widget, onUpdate, onDelete, allWidgets = [] }: WidgetEditorProps) => {
  const [expanded, setExpanded] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [dependencyExpanded, setDependencyExpanded] = useState(false);
  const [tableConfigExpanded, setTableConfigExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    onUpdate({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handleAddOption = () => {
    const newOption: SelectOption = {
      value: '',
      label: 'New Option'
    };
    
    onUpdate({
      options: [...(widget.options || []), newOption]
    });
  };

  const handleUpdateOption = (index: number, field: keyof SelectOption, value: any) => {
    if (!widget.options) return;
    
    const updatedOptions = [...widget.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    
    onUpdate({ options: updatedOptions });
  };

  const handleDeleteOption = (index: number) => {
    if (!widget.options) return;
    
    const updatedOptions = widget.options.filter((_, i) => i !== index);
    onUpdate({ options: updatedOptions });
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        position: 'relative',
        '&:hover': {
          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} Widget
        </Typography>
        <Tooltip title="Delete Widget">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TextField
        fullWidth
        margin="dense"
        name="label"
        label="Label"
        value={widget.label}
        onChange={handleChange}
        size="small"
      />
      
      <TextField
        fullWidth
        margin="dense"
        name="field"
        label="Field Name"
        value={widget.field}
        onChange={handleChange}
        size="small"
        helperText="Unique identifier for this field"
      />
      
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel id={`widget-type-label-${widget.id}`}>Widget Type</InputLabel>
        <Select
          labelId={`widget-type-label-${widget.id}`}
          name="type"
          value={widget.type}
          label="Widget Type"
          onChange={handleSelectChange}
        >
          {Object.values(WidgetType).map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              name="required"
              checked={widget.required || false}
              onChange={handleChange}
              size="small"
            />
          }
          label="Required"
        />
        
        <FormControlLabel
          control={
            <Switch
              name="disabled"
              checked={widget.disabled || false}
              onChange={handleChange}
              size="small"
            />
          }
          label="Disabled"
        />
        
        <FormControlLabel
          control={
            <Switch
              name="hidden"
              checked={widget.hidden || false}
              onChange={handleChange}
              size="small"
            />
          }
          label="Hidden"
        />
      </Box>
      
      <Accordion expanded={advancedExpanded} onChange={() => setAdvancedExpanded(!advancedExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            margin="dense"
            name="placeholder"
            label="Placeholder"
            value={widget.placeholder || ''}
            onChange={handleChange}
            size="small"
          />
          
          <TextField
            fullWidth
            margin="dense"
            name="helperText"
            label="Helper Text"
            value={widget.helperText || ''}
            onChange={handleChange}
            size="small"
          />
          
          <TextField
            fullWidth
            margin="dense"
            name="defaultValue"
            label="Default Value"
            value={widget.defaultValue || ''}
            onChange={handleChange}
            size="small"
          />
          
          {(widget.type === WidgetType.SELECT || 
            widget.type === WidgetType.MULTISELECT || 
            widget.type === WidgetType.RADIO || 
            widget.type === WidgetType.CHECKBOX) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              
              {(widget.options || []).map((option, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="Value"
                    value={option.value}
                    onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                    sx={{ mr: 1, flexGrow: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Label"
                    value={option.label}
                    onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                    sx={{ mr: 1, flexGrow: 1 }}
                  />
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteOption(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleAddOption}
                sx={{ mt: 1 }}
              >
                Add Option
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <TextField
            fullWidth
            margin="dense"
            name="width"
            label="Width (% or px)"
            value={widget.width || ''}
            onChange={handleChange}
            size="small"
            placeholder="e.g., 100% or 200px"
          />
        </AccordionDetails>
      </Accordion>
      
      {/* Table Configuration */}
      {widget.type === WidgetType.TABLE && (
        <Accordion expanded={tableConfigExpanded} onChange={() => setTableConfigExpanded(!tableConfigExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Table Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableWidgetConfig
              config={{
                id: widget.id,
                label: widget.label,
                field: widget.field,
                columns: widget.columns || [],
                minRows: widget.minRows || 1,
                maxRows: widget.maxRows,
                allowAddRows: widget.allowAddRows !== false,
                allowDeleteRows: widget.allowDeleteRows !== false,
                showRowNumbers: widget.showRowNumbers !== false,
                showTotals: widget.showTotals === true
              }}
              onChange={(tableConfig) => {
                onUpdate({
                  columns: tableConfig.columns,
                  minRows: tableConfig.minRows,
                  maxRows: tableConfig.maxRows,
                  allowAddRows: tableConfig.allowAddRows,
                  allowDeleteRows: tableConfig.allowDeleteRows,
                  showRowNumbers: tableConfig.showRowNumbers,
                  showTotals: tableConfig.showTotals
                });
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Dependency Configuration */}
      {(widget.type === WidgetType.TEXT || 
        widget.type === WidgetType.NUMBER || 
        widget.type === WidgetType.SELECT || 
        widget.type === WidgetType.MULTISELECT || 
        widget.type === WidgetType.RADIO || 
        widget.type === WidgetType.CHECKBOX ||
        widget.type === WidgetType.SWITCH) && (
        <Accordion expanded={dependencyExpanded} onChange={() => setDependencyExpanded(!dependencyExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Dependency Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure when this field should be shown, hidden, enabled, or disabled based on other fields' values.
            </Typography>
            
            <DependencyEditor
              widgetId={widget.id}
              dependency={widget.dependency || null}
              availableFields={allWidgets.map(w => ({
                id: w.id,
                field: w.field,
                label: w.label,
                type: w.type
              }))}
              onUpdate={(dependency) => {
                onUpdate({ dependency: dependency || undefined });
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default WidgetEditor;
