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
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { TableColumn } from '@screen-builder/common';
import ColumnDialog from './ColumnDialog.tsx';

const columnTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'switch', label: 'Switch' },
  { value: 'formula', label: 'Formula' }
];

interface TableWidgetConfigProps {
  config: {
    id: string;
    label: string;
    field: string;
    columns: TableColumn[];
    minRows: number;
    maxRows?: number;
    allowAddRows: boolean;
    allowDeleteRows: boolean;
    showRowNumbers: boolean;
    showTotals: boolean;
  };
  onChange: (config: any) => void;
}

const TableWidgetConfig: React.FC<TableWidgetConfigProps> = ({ config, onChange }) => {
  const [columns, setColumns] = useState<TableColumn[]>(config.columns || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [minRows, setMinRows] = useState(config.minRows || 1);
  const [maxRows, setMaxRows] = useState(config.maxRows);
  const [allowAddRows, setAllowAddRows] = useState(config.allowAddRows !== false);
  const [allowDeleteRows, setAllowDeleteRows] = useState(config.allowDeleteRows !== false);
  const [showRowNumbers, setShowRowNumbers] = useState(config.showRowNumbers !== false);
  const [showTotals, setShowTotals] = useState(config.showTotals === true);

  
  // Update parent when configuration changes
  useEffect(() => {
    onChange({
      ...config,
      columns,
      minRows,
      maxRows,
      allowAddRows,
      allowDeleteRows,
      showRowNumbers,
      showTotals
    });
  }, [columns, minRows, maxRows, allowAddRows, allowDeleteRows, showRowNumbers, showTotals, config, onChange]);
  
  // Open dialog to add a new column
  const handleAddColumn = () => {
    setEditingColumn(null);
    setDialogOpen(true);
  };
  
  // Open dialog to edit an existing column
  const handleEditColumn = (column: TableColumn) => {
    setEditingColumn(column);
    setDialogOpen(true);
  };
  
  // Delete a column
  const handleDeleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
  };
  
  // Handle column save from dialog
  const handleSaveColumn = (column: TableColumn) => {
    if (editingColumn) {
      // Update existing column
      setColumns(columns.map(col => col.id === column.id ? column : col));
    } else {
      // Add new column
      setColumns([...columns, column]);
    }
    setDialogOpen(false);
  };

  // These functions have been replaced by the dialog-based approach

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Table Configuration</Typography>
      
      {/* Basic Settings */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          margin="dense"
          label="Table Label"
          value={config.label || ''}
          onChange={(e) => onChange({ ...config, label: e.target.value })}
        />
        
        <TextField
          fullWidth
          margin="dense"
          label="Field Name"
          value={config.field || ''}
          onChange={(e) => onChange({ ...config, field: e.target.value })}
          helperText="Unique identifier for this table in the form data"
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            label="Min Rows"
            type="number"
            value={minRows}
            onChange={(e) => setMinRows(parseInt(e.target.value) || 1)}
            InputProps={{ inputProps: { min: 0 } }}
          />
          
          <TextField
            label="Max Rows"
            type="number"
            value={maxRows || ''}
            onChange={(e) => setMaxRows(e.target.value ? parseInt(e.target.value) : undefined)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={allowAddRows}
                onChange={(e) => setAllowAddRows(e.target.checked)}
              />
            }
            label="Allow Adding Rows"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={allowDeleteRows}
                onChange={(e) => setAllowDeleteRows(e.target.checked)}
              />
            }
            label="Allow Deleting Rows"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showRowNumbers}
                onChange={(e) => setShowRowNumbers(e.target.checked)}
              />
            }
            label="Show Row Numbers"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showTotals}
                onChange={(e) => setShowTotals(e.target.checked)}
              />
            }
            label="Show Totals Row"
          />
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Column Configuration */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Columns</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddColumn}
          variant="contained"
          size="small"
        >
          Add Column
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Header</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Width</TableCell>
              <TableCell align="center">Editable</TableCell>
              <TableCell align="center">Required</TableCell>
              <TableCell width="100px" align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                  <Typography color="text.secondary">
                    No columns defined. Click "Add Column" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {columns.map((column) => (
              <TableRow key={column.id}>
                <TableCell>{column.header}</TableCell>
                <TableCell>
                  {columnTypes.find(t => t.value === column.type)?.label || column.type}
                </TableCell>
                <TableCell>{column.width || '-'}</TableCell>
                <TableCell align="center">
                  {column.editable !== false ? 'Yes' : 'No'}
                </TableCell>
                <TableCell align="center">
                  {column.required === true ? 'Yes' : 'No'}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton size="small" onClick={() => handleEditColumn(column)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteColumn(column.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Column Editor Dialog */}
      {dialogOpen && (
        <ColumnDialog
          open={dialogOpen}
          column={editingColumn}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveColumn}
        />
      )}
    </Box>
  );
};

export default TableWidgetConfig;
