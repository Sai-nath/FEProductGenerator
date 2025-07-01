import React, { useState, useEffect, useCallback } from 'react';
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
  FormHelperText,
  Button,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CalculateIcon from '@mui/icons-material/Calculate';
import SettingsIcon from '@mui/icons-material/Settings';
import { v4 as uuidv4 } from 'uuid';
import { executeApiCall, extractDataFromResponse, ApiConfig, ApiBindingOptions } from '../../services/apiBinding';
import ApiBindingDialog from './ApiBindingDialog';
// Define types locally to avoid import issues
interface TableColumn {
  id: string;
  field?: string;
  header: string;
  headerName?: string;
  width?: string | number;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'switch' | 'formula' | 'string' | 'date' | 'boolean' | 'actions';
  editable?: boolean;
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: { value: string | number; label: string; disabled?: boolean }[];
  formula?: string;
  defaultValue?: any;
  renderCell?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface TableRowType {
  id: string;
  cells: Record<string, any>;
  isValid?: boolean;
}

export interface TableWidgetProps {
  id: string;
  columns: TableColumn[];
  initialRows?: TableRowType[];
  minRows?: number;
  maxRows?: number;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  showRowNumbers?: boolean;
  showTotals?: boolean;
  onChange?: (rows: TableRowType[]) => void;
  apiBinding?: {
    apiConfig?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      params?: Record<string, any>;
      body?: any;
      responseMapping?: {
        tableData?: {
          path: string;
          columns: Record<string, string>;
        };
      };
      mockResponse?: any;
      useMock?: boolean;
    };
    loadOnRender?: boolean;
    errorHandling?: {
      showError: boolean;
      errorMessage?: string;
    };
  };
  formValues?: Record<string, any>;
  onValidate?: (isValid: boolean) => void;
  label?: string;
}

const TableWidget: React.FC<TableWidgetProps> = ({
  id,
  columns,
  initialRows,
  minRows = 1,
  maxRows,
  allowAddRows = true,
  allowDeleteRows = true,
  showRowNumbers = false,
  showTotals = false,
  onChange,
  apiBinding,
  formValues,
  label,
  onValidate
}) => {
  const [rows, setRows] = useState<TableRowType[]>(initialRows || []);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiDialog, setShowApiDialog] = useState<boolean>(false);
  const [currentApiBinding, setCurrentApiBinding] = useState<ApiBindingOptions | undefined>(apiBinding);

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
    const newTotals: Record<string, number> = {};
    
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
  // Load data from API if configured
  const loadDataFromApi = useCallback(async (
    formValues?: Record<string, any>,
    apiConfig?: ApiConfig
  ) => {
    const config = apiConfig || currentApiBinding?.apiConfig;
    if (!config) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await executeApiCall(config, formValues);
      
      if (config.responseMapping?.tableData) {
        const tableData = extractDataFromResponse(response, config.responseMapping);
        if (Array.isArray(tableData)) {
          setRows(tableData);
        }
      } else {
        // If no specific mapping, try to use the response directly if it's an array
        if (Array.isArray(response)) {
          const mappedRows = response.map((item: any) => ({
            id: item.id || uuidv4(),
            cells: { ...item }
          }));
          setRows(mappedRows);
        } else if (response && typeof response === 'object') {
          // Try to find an array in the response
          const possibleArrays = Object.values(response).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            const mappedRows = (possibleArrays[0] as any[]).map((item: any) => ({
              id: item.id || uuidv4(),
              cells: { ...item }
            }));
            setRows(mappedRows);
          }
        }
      }
    } catch (err) {
      console.error('Error loading table data from API:', err);
      setError(currentApiBinding?.errorHandling?.errorMessage || 'Failed to load data from API');
    } finally {
      setIsLoading(false);
    }
  }, [currentApiBinding]);

  // Load data on initial render if configured
  useEffect(() => {
    if (currentApiBinding?.loadOnRender && currentApiBinding.apiConfig) {
      loadDataFromApi(formValues);
    }
  }, [currentApiBinding, loadDataFromApi, formValues]);

  useEffect(() => {
    if (showTotals) {
      calculateTotals(rows);
    }
  }, [rows, showTotals]);

  // Handle API binding dialog save
  const handleApiBindingSave = (newApiBinding: ApiBindingOptions) => {
    setCurrentApiBinding(newApiBinding);
    setShowApiDialog(false);
    // If the new API binding has a configuration and is set to load on render, load the data
    if (newApiBinding.apiConfig && newApiBinding.loadOnRender) {
      loadDataFromApi(formValues, newApiBinding.apiConfig);
    }
  };
  
  // Render a cell based on its type
  const renderCell = (row: TableRowType, column: TableColumn, rowIndex: number) => {
    const value = row.cells[column.id];
    
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
  <>
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        {label && (
          <Typography variant="subtitle1">
            {label}
          </Typography>
        )}
        <Button
          startIcon={<SettingsIcon />}
          size="small"
          variant="outlined"
          onClick={() => setShowApiDialog(true)}
        >
          Configure API
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ width: '100%', overflow: 'auto' }}>
        {isLoading && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Loading data...
            </Typography>
          </Box>
        )}
        
        {error && currentApiBinding?.errorHandling?.showError && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        
        <Table size="small" aria-label="table widget">
          <TableHead>
            <MuiTableRow>
              {showRowNumbers && <TableCell width="50px">#</TableCell>}
              {columns.map((column) => (
                <TableCell 
                  key={column.id} 
                  width={column.width} 
                  align={column.type === 'number' || column.type === 'formula' ? 'right' : 'left'}
                >
                  {column.header || column.headerName || ''}
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
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => deleteRow(rowIndex)}
                      disabled={rows.length <= minRows}
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
                  <TableCell key={`total-${column.id}`} align={column.type === 'number' || column.type === 'formula' ? 'right' : 'left'}>
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
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
          {allowAddRows && (!maxRows || rows.length < maxRows) && (
            <Button
              startIcon={<AddIcon />}
              onClick={addRow}
              size="small"
              variant="outlined"
            >
              Add Row
            </Button>
          )}
          
          {currentApiBinding?.apiConfig && (
            <Button
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
              onClick={() => loadDataFromApi(formValues)}
              size="small"
              variant="outlined"
              color="primary"
              disabled={isLoading}
            >
              Refresh Data
            </Button>
          )}
        </Box>
      </TableContainer>
    </Box>
    
    {/* API Binding Dialog */}
    <ApiBindingDialog
      open={showApiDialog}
      onClose={() => setShowApiDialog(false)}
      onSave={handleApiBindingSave}
      initialApiBinding={currentApiBinding}
      widgetType="table"
    />
  </>
  );
};

export default TableWidget;
