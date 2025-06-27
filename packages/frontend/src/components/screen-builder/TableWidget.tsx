import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow as MuiTableRow,
  Paper,
  TextField,
  IconButton,
  Typography,
  Box,
  Checkbox,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import { TableColumn, TableRow as TableRowType } from '@screen-builder/common';

export interface TableWidgetProps {
  id: string;
  label: string;
  columns: TableColumn[];
  initialRows?: TableRowType[];
  minRows?: number;
  maxRows?: number;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  readOnly?: boolean;
  showRowNumbers?: boolean;
  showTotals?: boolean;
  onChange?: (rows: TableRowType[]) => void;
  onValidate?: (isValid: boolean) => void;
}

const TableWidget: React.FC<TableWidgetProps> = ({
  id,
  label,
  columns,
  initialRows = [],
  minRows = 1,
  maxRows,
  allowAddRows = true,
  allowDeleteRows = true,
  readOnly = false,
  showRowNumbers = true,
  showTotals = false,
  onChange,
  onValidate
}) => {
  const [rows, setRows] = useState<TableRowType[]>(initialRows.length > 0 ? initialRows : [createEmptyRow()]);
  const [totals, setTotals] = useState<Record<string, any>>({});

  // Create an empty row with default values
  function createEmptyRow(): TableRowType {
    const cells: Record<string, any> = {};
    columns.forEach(col => {
      cells[col.id] = col.defaultValue !== undefined ? col.defaultValue : '';
    });
    return { id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, cells };
  }

  // Add a new row
  const addRow = () => {
    if (maxRows && rows.length >= maxRows) return;
    const newRows = [...rows, createEmptyRow()];
    setRows(newRows);
    if (onChange) onChange(newRows);
  };

  // Delete a row
  const deleteRow = (index: number) => {
    if (rows.length <= minRows) return;
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
    if (onChange) onChange(newRows);
  };

  // Handle cell value change
  const handleCellChange = (rowIndex: number, columnId: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex].cells[columnId] = value;
    
    // Recalculate formula cells in this row
    columns.forEach(col => {
      if (col.type === 'formula' && col.formula) {
        newRows[rowIndex].cells[col.id] = evaluateFormula(col.formula, newRows[rowIndex].cells);
      }
    });
    
    setRows(newRows);
    calculateTotals(newRows);
    if (onChange) onChange(newRows);
  };

  // Evaluate a formula expression
  const evaluateFormula = (formula: string, cells: Record<string, any>): number => {
    try {
      // Replace column references with actual values
      let expression = formula;
      columns.forEach(col => {
        const value = cells[col.id] || 0;
        expression = expression.replace(new RegExp(col.id, 'g'), value.toString());
      });
      
      // Use Function constructor to safely evaluate the expression
      // eslint-disable-next-line no-new-func
      return new Function(`return ${expression}`)();
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return 0;
    }
  };

  // Calculate column totals
  const calculateTotals = (currentRows: TableRowType[]) => {
    const newTotals: Record<string, any> = {};
    
    columns.forEach(col => {
      if (col.type === 'number' || col.type === 'formula') {
        newTotals[col.id] = currentRows.reduce((sum, row) => {
          const value = parseFloat(row.cells[col.id]);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
      }
    });
    
    setTotals(newTotals);
  };

  // Initialize with minimum rows
  useEffect(() => {
    if (rows.length < minRows) {
      const newRows = [...rows];
      while (newRows.length < minRows) {
        newRows.push(createEmptyRow());
      }
      setRows(newRows);
      if (onChange) onChange(newRows);
    }
    
    calculateTotals(rows);
  }, [minRows]);

  // Render a cell based on its type
  const renderCell = (row: TableRowType, column: TableColumn, rowIndex: number) => {
    const value = row.cells[column.id];
    
    if (readOnly) {
      if (column.type === 'checkbox') {
        return <Checkbox checked={!!value} disabled />;
      } else if (column.type === 'switch') {
        return <Switch checked={!!value} disabled />;
      } else if (column.type === 'select' && column.options) {
        const option = column.options.find(opt => opt.value === value);
        return option ? option.label : value;
      }
      return value;
    }

    switch (column.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            required={column.required}
            disabled={!column.editable}
          />
        );
        
      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            value={value || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            required={column.required}
            disabled={!column.editable}
            InputProps={{
              inputProps: {
                min: column.validation?.min,
                max: column.validation?.max,
              }
            }}
          />
        );
        
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={value || ''}
              onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
              disabled={!column.editable}
            >
              {(column.options || []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.checked)}
            disabled={!column.editable}
          />
        );
        
      case 'switch':
        return (
          <Switch
            checked={!!value}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.checked)}
            disabled={!column.editable}
          />
        );
        
      case 'formula':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            value={value || 0}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title={column.formula || ''}>
                    <CalculateIcon fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        );
        
      default:
        return value;
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {label && (
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>
      )}
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <MuiTableRow>
              {showRowNumbers && <TableCell width="50px">#</TableCell>}
              
              {columns.map((column) => (
                <TableCell 
                  key={column.id} 
                  width={column.width}
                  align={column.type === 'number' || column.type === 'formula' ? 'right' : 'left'}
                >
                  {column.header}
                </TableCell>
              ))}
              
              {allowDeleteRows && <TableCell width="50px"></TableCell>}
            </MuiTableRow>
          </TableHead>
          
          <TableBody>
            {rows.map((row, rowIndex) => (
              <MuiTableRow key={row.id}>
                {showRowNumbers && <TableCell>{rowIndex + 1}</TableCell>}
                
                {columns.map((column) => (
                  <TableCell 
                    key={`${row.id}-${column.id}`}
                    align={column.type === 'number' || column.type === 'formula' ? 'right' : 'left'}
                  >
                    {renderCell(row, column, rowIndex)}
                  </TableCell>
                ))}
                
                {allowDeleteRows && (
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => deleteRow(rowIndex)}
                      disabled={rows.length <= minRows || readOnly}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </MuiTableRow>
            ))}
            
            {showTotals && (
              <MuiTableRow>
                {showRowNumbers && <TableCell>Σ</TableCell>}
                
                {columns.map((column) => (
                  <TableCell 
                    key={`total-${column.id}`}
                    align={column.type === 'number' || column.type === 'formula' ? 'right' : 'left'}
                  >
                    {(column.type === 'number' || column.type === 'formula') && totals[column.id] !== undefined
                      ? totals[column.id]
                      : ''}
                  </TableCell>
                ))}
                
                {allowDeleteRows && <TableCell />}
              </MuiTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {allowAddRows && !readOnly && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            startIcon={<AddIcon />}
            onClick={addRow}
            disabled={maxRows !== undefined && rows.length >= maxRows}
            size="small"
          >
            Add Row
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TableWidget;
