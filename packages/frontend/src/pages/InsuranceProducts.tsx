import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { insuranceProductApi, lineOfBusinessApi, screenConfigurationApi, InsuranceProduct, LineOfBusiness, ScreenConfiguration } from '../services/api';

const InsuranceProducts = () => {
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [linesOfBusiness, setLinesOfBusiness] = useState<LineOfBusiness[]>([]);
  const [screenConfigurations, setScreenConfigurations] = useState<ScreenConfiguration[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<InsuranceProduct>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchProducts();
    fetchLinesOfBusiness();
    fetchScreenConfigurations();
  }, []);
  
  const fetchProducts = async () => {
    try {
      const data = await insuranceProductApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching insurance products:', error);
    }
  };
  
  const fetchLinesOfBusiness = async () => {
    try {
      const data = await lineOfBusinessApi.getAll();
      setLinesOfBusiness(data);
    } catch (error) {
      console.error('Error fetching lines of business:', error);
    }
  };
  
  const fetchScreenConfigurations = async () => {
    try {
      const data = await screenConfigurationApi.getAll();
      setScreenConfigurations(data.filter(screen => screen.isActive));
    } catch (error) {
      console.error('Error fetching screen configurations:', error);
    }
  };
  
  const handleOpenDialog = (product?: InsuranceProduct) => {
    if (product) {
      setCurrentProduct({
        id: product.id,
        productKey: product.productKey,
        productName: product.productName,
        description: product.description,
        lobId: product.lobId,
        screenConfigId: product.screenConfigId,
        isActive: product.isActive
      });
      setIsEditing(true);
    } else {
      setCurrentProduct({ 
        productKey: '', 
        productName: '', 
        description: '', 
        isActive: true 
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentProduct({});
  };
  
  const handleOpenDeleteDialog = (product: InsuranceProduct) => {
    setCurrentProduct(product);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentProduct({});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };
  
  const handleSubmit = async () => {
    try {
      if (isEditing && currentProduct.id) {
        await insuranceProductApi.update(currentProduct.id, currentProduct);
      } else {
        await insuranceProductApi.create(currentProduct);
      }
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving insurance product:', error);
    }
  };
  
  const handleDelete = async () => {
    try {
      if (currentProduct.id) {
        await insuranceProductApi.delete(currentProduct.id);
        handleCloseDeleteDialog();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting insurance product:', error);
    }
  };
  
  return (
    <Box sx={{ p: 3, pl: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#34568B' }}>Insurance Products</Typography>
        <Button 
          variant="contained"
          sx={{ 
            background: 'linear-gradient(to right, #34568B, #4a6d9c)',
            boxShadow: '0 2px 8px rgba(52, 86, 139, 0.3)',
          }}
          onClick={() => handleOpenDialog()}
        >
          Add New
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Key</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Line of Business</TableCell>
              <TableCell>Screen Configuration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No insurance products found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.productKey}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.lob?.name || '-'}</TableCell>
                  <TableCell>{product.screenConfig?.screenName || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.isActive ? 'Active' : 'Inactive'} 
                      color={product.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Insurance Product' : 'Add New Insurance Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="productKey"
            label="Product Key"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProduct.productKey || ''}
            onChange={handleInputChange}
            required
            helperText="Unique identifier for the product (e.g., 'health_optima_secure')"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="productName"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProduct.productName || ''}
            onChange={handleInputChange}
            required
            helperText="Display name for the product"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProduct.description || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="lob-select-label">Line of Business</InputLabel>
            <Select
              labelId="lob-select-label"
              id="lob-select"
              name="lobId"
              value={currentProduct.lobId || ''}
              label="Line of Business"
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {linesOfBusiness.map((lob) => (
                <MenuItem key={lob.id} value={lob.id}>
                  {lob.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required>
            <InputLabel id="screen-select-label">Screen Configuration</InputLabel>
            <Select
              labelId="screen-select-label"
              id="screen-select"
              name="screenConfigId"
              value={currentProduct.screenConfigId || ''}
              label="Screen Configuration"
              onChange={handleSelectChange}
              required
            >
              {screenConfigurations.map((screen) => (
                <MenuItem key={screen.id} value={screen.id}>
                  {screen.screenName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={currentProduct.isActive || false}
                onChange={handleInputChange}
                color="primary"
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!currentProduct.productKey || !currentProduct.productName || !currentProduct.screenConfigId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the insurance product "{currentProduct.productName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsuranceProducts;
