import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Switch,
  Typography,
  Slider,
  FormGroup,
  Autocomplete,
  Chip,
  ListItemText
} from '@mui/material';
import TableWidget, { TableColumn, TableRow as TableRowType } from './TableWidget';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Import WidgetDependency type from DependencyEditor
import { WidgetDependency } from './DependencyEditor';

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
  DIVIDER = 'divider',
}

interface SelectOption {
  value: string;
  label: string;
}

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
  options?: SelectOption[];
  width?: string;
  dependency?: WidgetDependency;
  // Table widget specific properties
  columns?: TableColumn[];
  minRows?: number;
  maxRows?: number;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  showRowNumbers?: boolean;
  showTotals?: boolean;
  // Slider widget specific properties
  min?: number;
  max?: number;
}

interface WidgetPreviewProps {
  widget: Widget;
  allWidgets?: Widget[];
  formValues?: Record<string, any>;
  onValueChange?: (field: string, value: any) => void;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  widget,
  allWidgets = [],
  formValues = {},
  onValueChange,
}) => {
  const [value, setValue] = useState<any>(widget.defaultValue || '');
  const [isVisible, setIsVisible] = useState(true);
  const [isEnabled, setIsEnabled] = useState(!widget.disabled);
  const [isRequired, setIsRequired] = useState(widget.required || false);

  // Initialize value from formValues if available
  useEffect(() => {
    if (formValues[widget.field] !== undefined) {
      setValue(formValues[widget.field]);
    }
  }, [formValues, widget.field]);

  // Handle dependency logic
  useEffect(() => {
    if (!widget.dependency) return;

    const { parentFieldId, condition, value: targetValue, action } = widget.dependency;
    const parentValue = formValues[parentFieldId];
    
    console.log(`Checking dependency for ${widget.field}:`, {
      parentFieldId,
      condition,
      targetValue,
      action,
      parentValue,
      formValues
    });

    let conditionMet = false;

    switch (condition) {
      case 'equals':
        conditionMet = String(parentValue) === String(targetValue);
        break;
      case 'notEquals':
        conditionMet = String(parentValue) !== String(targetValue);
        break;
      case 'contains':
        if (Array.isArray(targetValue)) {
          conditionMet = targetValue.includes(parentValue);
        } else if (typeof parentValue === 'string' && typeof targetValue === 'string') {
          conditionMet = parentValue.includes(targetValue);
        }
        break;
      case 'notContains':
        if (Array.isArray(targetValue)) {
          conditionMet = !targetValue.includes(parentValue);
        } else if (typeof parentValue === 'string' && typeof targetValue === 'string') {
          conditionMet = !parentValue.includes(targetValue);
        }
        break;
      case 'isEmpty':
        conditionMet = !parentValue || parentValue === '' || (Array.isArray(parentValue) && parentValue.length === 0);
        break;
      case 'isNotEmpty':
        conditionMet = parentValue && parentValue !== '' && (!Array.isArray(parentValue) || parentValue.length > 0);
        break;
      default:
        conditionMet = false;
    }
    
    console.log(`Dependency result for ${widget.field}:`, { conditionMet });

    // Apply the action based on whether the condition is met
    switch (action) {
      case 'show':
        setIsVisible(conditionMet);
        break;
      case 'hide':
        setIsVisible(!conditionMet);
        break;
      case 'enable':
        setIsEnabled(conditionMet);
        break;
      case 'disable':
        setIsEnabled(!conditionMet);
        break;
      case 'require':
        setIsRequired(conditionMet);
        break;
      case 'optional':
        setIsRequired(!conditionMet);
        break;
    }
  }, [widget.dependency, formValues]);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(widget.field, newValue);
    }
  };

  // Instead of returning null, we'll let the parent component decide how to handle visibility
  // Export visibility state via a data attribute that can be used by parent components
  if (!isVisible) return null;
  if (widget.hidden) {
    return null;
  }

  const renderWidget = () => {
    if (widget.hidden || !isVisible) {
      return null;
    }

    const commonProps = {
      label: widget.label,
      required: isRequired,
      disabled: !isEnabled,
      placeholder: widget.placeholder,
      helperText: widget.helperText,
      fullWidth: true,
      size: 'small' as 'small',
      sx: { mb: 1 },
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)
    };

    switch (widget.type) {
      case WidgetType.TEXT:
        return <TextField {...commonProps} />;
        
      case WidgetType.NUMBER:
        return <TextField {...commonProps} type="number" />;
        
      case WidgetType.EMAIL:
        return <TextField {...commonProps} type="email" />;
        
      case WidgetType.PASSWORD:
        return <TextField {...commonProps} type="password" />;
        
      case WidgetType.TEXTAREA:
        return <TextField {...commonProps} multiline rows={4} />;
        
      case WidgetType.CHECKBOX:
        if (widget.options && widget.options.length > 0) {
          return (
            <FormControl component="fieldset" required={widget.required} disabled={widget.disabled}>
              <Typography variant="subtitle2" gutterBottom>{widget.label}</Typography>
              <FormGroup>
                {widget.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    control={<Checkbox />}
                    label={option.label}
                  />
                ))}
              </FormGroup>
              {widget.helperText && <FormHelperText>{widget.helperText}</FormHelperText>}
            </FormControl>
          );
        } else {
          return (
            <FormControlLabel
              control={
                <Checkbox
                  required={widget.required}
                  disabled={widget.disabled}
                />
              }
              label={widget.label}
            />
          );
        }
        
      case WidgetType.RADIO:
        return (
          <FormControl component="fieldset" required={isRequired} disabled={!isEnabled} fullWidth>
            <Typography variant="subtitle2" gutterBottom>{widget.label}</Typography>
            <RadioGroup 
              value={value} 
              onChange={(e) => handleChange(e.target.value)}
            >
              {(widget.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {widget.helperText && <FormHelperText>{widget.helperText}</FormHelperText>}
          </FormControl>
        );
        
      case WidgetType.SELECT:
        return (
          <FormControl fullWidth size="small" required={widget.required} disabled={widget.disabled}>
            <InputLabel id={`select-label-${widget.id}`}>{widget.label}</InputLabel>
            <Select
              labelId={`select-label-${widget.id}`}
              label={widget.label}
              defaultValue={widget.defaultValue || ''}
            >
              {(widget.options || []).map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {widget.helperText && <FormHelperText>{widget.helperText}</FormHelperText>}
          </FormControl>
        );
        
      case WidgetType.MULTISELECT:
        return (
          <FormControl fullWidth size="small" required={widget.required} disabled={widget.disabled}>
            <InputLabel id={`multiselect-label-${widget.id}`}>{widget.label}</InputLabel>
            <Select
              labelId={`multiselect-label-${widget.id}`}
              label={widget.label}
              multiple
              defaultValue={[]}
              renderValue={(selected: any) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value: string) => {
                    const option = (widget.options || []).find(opt => opt.value === value);
                    return <Chip key={value} label={option?.label || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {(widget.options || []).map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  <Checkbox />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
            {widget.helperText && <FormHelperText>{widget.helperText}</FormHelperText>}
          </FormControl>
        );
        
      case WidgetType.DATE:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={widget.label}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  required: widget.required,
                  disabled: widget.disabled,
                  helperText: widget.helperText
                }
              }}
            />
          </LocalizationProvider>
        );
        
      case WidgetType.SWITCH:
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  required={widget.required}
                  disabled={widget.disabled}
                />
              }
              label={widget.label}
            />
            {widget.helperText && <FormHelperText>{widget.helperText}</FormHelperText>}
          </Box>
        );
        
      case WidgetType.SLIDER:
        return (
          <Box sx={{ width: '100%' }}>
            <Typography id={`slider-label-${widget.id}`} gutterBottom>
              {widget.label}
            </Typography>
            <Slider
              aria-labelledby={`slider-label-${widget.id}`}
              valueLabelDisplay="auto"
              disabled={widget.disabled}
              min={widget.min || 0}
              max={widget.max || 100}
              defaultValue={widget.defaultValue ? Number(widget.defaultValue) : 0}
            />
            {widget.helperText && <FormHelperText>{widget.helperText}</FormHelperText>}
          </Box>
        );
        
      case WidgetType.AUTOCOMPLETE:
        return (
          <Autocomplete
            options={(widget.options || []).map(option => ({ label: option.label, value: option.value }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label={widget.label}
                required={widget.required}
                disabled={widget.disabled}
                helperText={widget.helperText}
                size="small"
              />
            )}
            disabled={widget.disabled}
          />
        );
        
      case WidgetType.HEADING:
        return (
          <Typography variant="h6" gutterBottom>
            {widget.label}
          </Typography>
        );
        
      case WidgetType.PARAGRAPH:
        return (
          <Typography variant="body1" gutterBottom>
            {widget.defaultValue || widget.label}
          </Typography>
        );
        
      case WidgetType.DIVIDER:
        return (
          <Box sx={{ my: 2 }}>
            {widget.label && (
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {widget.label}
              </Typography>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }} />
          </Box>
        );
        
      case WidgetType.TABLE:
        return (
          <TableWidget
            id={widget.id}
            label={widget.label}
            columns={(widget.columns || []) as TableColumn[]}
            initialRows={formValues[widget.field] || []}
            minRows={widget.minRows || 1}
            maxRows={widget.maxRows}
            allowAddRows={widget.allowAddRows !== false}
            allowDeleteRows={widget.allowDeleteRows !== false}
            readOnly={!isEnabled}
            showRowNumbers={widget.showRowNumbers !== false}
            showTotals={widget.showTotals === true}
            onChange={(rows: TableRowType[]) => handleChange(rows)}
          />
        );
        
      default:
        return <TextField {...commonProps} />;
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderWidget()}
    </Box>
  );
};

export default WidgetPreview;
