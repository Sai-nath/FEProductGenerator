import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Define dependency types
export interface WidgetDependency {
  parentFieldId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'isEmpty' | 'isNotEmpty';
  value?: string | string[];
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

interface DependencyEditorProps {
  widgetId: string;
  dependency: WidgetDependency | null;
  availableFields: Array<{ id: string; field: string; label: string; type: string }>;
  onUpdate: (dependency: WidgetDependency | null) => void;
}

const DependencyEditor: React.FC<DependencyEditorProps> = ({
  widgetId,
  dependency,
  availableFields,
  onUpdate
}) => {
  const [localDependency, setLocalDependency] = useState<WidgetDependency | null>(dependency);
  const [multiValues, setMultiValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState<string>('');

  useEffect(() => {
    setLocalDependency(dependency);
    if (dependency?.value && Array.isArray(dependency.value)) {
      setMultiValues(dependency.value);
    } else if (dependency?.value) {
      setMultiValues([dependency.value as string]);
    } else {
      setMultiValues([]);
    }
  }, [dependency]);

  const handleChange = (field: keyof WidgetDependency, value: any) => {
    if (!localDependency) {
      const newDependency: WidgetDependency = {
        parentFieldId: '',
        condition: 'equals',
        action: 'show'
      };
      setLocalDependency({ ...newDependency, [field]: value });
      return;
    }

    // Reset value when changing condition type
    if (field === 'condition') {
      const needsValue = ['equals', 'notEquals', 'contains', 'notContains'].includes(value);
      const updatedDep = { 
        ...localDependency, 
        [field]: value,
        value: needsValue ? localDependency.value : undefined
      };
      setLocalDependency(updatedDep);
      onUpdate(updatedDep);
      return;
    }

    const updatedDep = { ...localDependency, [field]: value };
    setLocalDependency(updatedDep);
    onUpdate(updatedDep);
  };

  const handleAddValue = () => {
    if (!newValue.trim()) return;
    
    const updatedValues = [...multiValues, newValue.trim()];
    setMultiValues(updatedValues);
    setNewValue('');
    
    if (localDependency) {
      const updatedDep = { ...localDependency, value: updatedValues };
      setLocalDependency(updatedDep);
      onUpdate(updatedDep);
    }
  };

  const handleDeleteValue = (index: number) => {
    const updatedValues = multiValues.filter((_, i) => i !== index);
    setMultiValues(updatedValues);
    
    if (localDependency) {
      const updatedDep = { ...localDependency, value: updatedValues.length ? updatedValues : undefined };
      setLocalDependency(updatedDep);
      onUpdate(updatedDep);
    }
  };

  const handleSingleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (localDependency) {
      const updatedDep = { ...localDependency, value };
      setLocalDependency(updatedDep);
      onUpdate(updatedDep);
    }
  };

  const handleRemoveDependency = () => {
    setLocalDependency(null);
    onUpdate(null);
  };

  const needsValue = localDependency && ['equals', 'notEquals', 'contains', 'notContains'].includes(localDependency.condition);
  const isMultiValue = localDependency && ['contains', 'notContains'].includes(localDependency.condition);

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">Dependency Configuration</Typography>
        {localDependency && (
          <Button 
            size="small" 
            color="error" 
            variant="outlined" 
            onClick={handleRemoveDependency}
            startIcon={<DeleteIcon />}
          >
            Remove Dependency
          </Button>
        )}
      </Box>

      {!localDependency ? (
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={() => handleChange('parentFieldId', '')}
        >
          Add Dependency
        </Button>
      ) : (
        <>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Parent Field</InputLabel>
            <Select
              value={localDependency.parentFieldId}
              label="Parent Field"
              onChange={(e) => handleChange('parentFieldId', e.target.value)}
            >
              {availableFields
                .filter(field => field.id !== widgetId) // Prevent self-dependency
                .map((field) => (
                  <MenuItem key={field.id} value={field.field}>
                    {field.label} ({field.field})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Condition</InputLabel>
            <Select
              value={localDependency.condition}
              label="Condition"
              onChange={(e) => handleChange('condition', e.target.value)}
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="notEquals">Not Equals</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="notContains">Does Not Contain</MenuItem>
              <MenuItem value="isEmpty">Is Empty</MenuItem>
              <MenuItem value="isNotEmpty">Is Not Empty</MenuItem>
            </Select>
          </FormControl>

          {needsValue && (
            <>
              {isMultiValue ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add Value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                    <Button 
                      variant="contained" 
                      sx={{ ml: 1 }} 
                      onClick={handleAddValue}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {multiValues.map((value, index) => (
                      <Chip
                        key={index}
                        label={value}
                        onDelete={() => handleDeleteValue(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <TextField
                  fullWidth
                  margin="dense"
                  size="small"
                  label="Value"
                  value={localDependency.value || ''}
                  onChange={handleSingleValueChange}
                />
              )}
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Action</InputLabel>
            <Select
              value={localDependency.action}
              label="Action"
              onChange={(e) => handleChange('action', e.target.value)}
            >
              <MenuItem value="show">Show</MenuItem>
              <MenuItem value="hide">Hide</MenuItem>
              <MenuItem value="enable">Enable</MenuItem>
              <MenuItem value="disable">Disable</MenuItem>
              <MenuItem value="require">Make Required</MenuItem>
              <MenuItem value="optional">Make Optional</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
    </Paper>
  );
};

export default DependencyEditor;
