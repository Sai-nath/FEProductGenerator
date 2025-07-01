import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FunctionsIcon from '@mui/icons-material/Functions';
import { TableColumn } from '@screen-builder/common';

// Define SelectOption locally to avoid import issues
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
import { v4 as uuidv4 } from 'uuid';

const columnTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'switch', label: 'Switch' },
  { value: 'formula', label: 'Formula' }
];

interface ColumnDialogProps {
  open: boolean;
  column: TableColumn | null;
  onClose: () => void;
  onSave: (column: TableColumn) => void;
}

const ColumnDialogComponent: React.FC<ColumnDialogProps> = ({ open, column, onClose, onSave }) => {
  const [tabValue, setTabValue] = useState(0);
  const [editedColumn, setEditedColumn] = useState<TableColumn>({
    id: '',
    header: '',
    type: 'text',
    editable: true,
    required: false,
    sortable: true,
    filterable: true,
    validation: {}
  });
  const [options, setOptions] = useState<SelectOption[]>([]);

  // Initialize form when dialog opens or column changes
  useEffect(() => {
    if (column) {
      setEditedColumn(column);
      setOptions(column.options || []);
    } else {
      setEditedColumn({
        id: uuidv4(),
        header: '',
        type: 'text',
        editable: true,
        required: false,
        sortable: true,
        filterable: true,
        validation: {}
      });
      setOptions([]);
    }
    setTabValue(0);
  }, [column, open]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'editable' || name === 'required' || name === 'sortable' || name === 'filterable') {
      setEditedColumn({ ...editedColumn, [name]: checked });
    } else {
      setEditedColumn({ ...editedColumn, [name]: value });
    }
  };

  // Handle select field changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEditedColumn({ ...editedColumn, [name]: value });
  };

  // Handle option management for select type
  const handleAddOption = () => {
    setOptions([...options, { value: '', label: '' }]);
  };

  const handleUpdateOption = (index: number, field: 'value' | 'label', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = () => {
    const finalColumn = {
      ...editedColumn,
      options: editedColumn.type === 'select' ? options : undefined
    };
    onSave(finalColumn);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {column ? 'Edit Column' : 'Add New Column'}
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Basic" />
          <Tab label="Advanced" />
          {editedColumn.type === 'select' && <Tab label="Options" />}
          {editedColumn.type === 'formula' && <Tab label="Formula" />}
        </Tabs>
        
        {/* Basic Tab */}
        {tabValue === 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Header"
              name="header"
              value={editedColumn.header}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={editedColumn.type}
                onChange={handleSelectChange}
                label="Type"
              >
                {columnTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Width"
              name="width"
              value={editedColumn.width || ''}
              onChange={handleChange}
              fullWidth
              helperText="Optional. Example: 100px, 10%, etc."
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="editable"
                    checked={editedColumn.editable !== false}
                    onChange={handleChange}
                  />
                }
                label="Editable"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    name="required"
                    checked={editedColumn.required === true}
                    onChange={handleChange}
                  />
                }
                label="Required"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    name="sortable"
                    checked={editedColumn.sortable !== false}
                    onChange={handleChange}
                  />
                }
                label="Sortable"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    name="filterable"
                    checked={editedColumn.filterable !== false}
                    onChange={handleChange}
                  />
                }
                label="Filterable"
              />
            </Box>
          </Box>
        )}
        
        {/* Advanced Tab */}
        {tabValue === 1 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Default Value"
              name="defaultValue"
              value={editedColumn.defaultValue || ''}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Field"
              name="field"
              value={editedColumn.field || ''}
              onChange={handleChange}
              fullWidth
              helperText="Optional. Data field name if different from header."
            />
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle1">Validation</Typography>
            
            {editedColumn.type === 'text' && (
              <TextField
                label="Min Length"
                name="minLength"
                type="number"
                value={editedColumn.validation?.min || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  setEditedColumn({
                    ...editedColumn,
                    validation: { ...editedColumn.validation || {}, min: value }
                  });
                }}
                fullWidth
              />
            )}
            
            {editedColumn.type === 'text' && (
              <TextField
                label="Max Length"
                name="maxLength"
                type="number"
                value={editedColumn.validation?.max || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  setEditedColumn({
                    ...editedColumn,
                    validation: { ...editedColumn.validation || {}, max: value }
                  });
                }}
                fullWidth
              />
            )}
            
            {editedColumn.type === 'number' && (
              <TextField
                label="Min Value"
                name="min"
                type="number"
                value={editedColumn.validation?.min || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  setEditedColumn({
                    ...editedColumn,
                    validation: { ...editedColumn.validation || {}, min: value }
                  });
                }}
                fullWidth
              />
            )}
            
            {editedColumn.type === 'number' && (
              <TextField
                label="Max Value"
                name="max"
                type="number"
                value={editedColumn.validation?.max || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  setEditedColumn({
                    ...editedColumn,
                    validation: { ...editedColumn.validation || {}, max: value }
                  });
                }}
                fullWidth
              />
            )}
            
            {editedColumn.type === 'text' && (
              <TextField
                label="Pattern"
                name="pattern"
                value={editedColumn.validation?.pattern || ''}
                onChange={(e) => {
                  setEditedColumn({
                    ...editedColumn,
                    validation: { ...editedColumn.validation || {}, pattern: e.target.value }
                  });
                }}
                fullWidth
                placeholder="e.g., ^[A-Za-z]+$"
              />
            )}
          </Box>
        )}
        
        {/* Options Tab */}
        {editedColumn.type === 'select' && tabValue === 2 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<Typography>+</Typography>}
                onClick={handleAddOption}
              >
                Add Option
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Value</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell width="100px">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {options.map((option, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          value={option.value}
                          onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={option.label}
                          onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteOption(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {options.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No options defined. Click "Add Option" to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {/* Formula Tab */}
        {editedColumn.type === 'formula' && tabValue === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Formula Expression
            </Typography>
            <TextField
              name="formula"
              value={editedColumn.formula || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., col1 + col2"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: 'text.secondary' }}>
                    <FunctionsIcon />
                  </Box>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Use column IDs in your formula. Example: col1 * 2 + col2
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!editedColumn.header}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnDialogComponent;
