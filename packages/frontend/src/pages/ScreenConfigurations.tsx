import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import { screenConfigurationApi, ScreenConfiguration } from '../services/api';

// Local implementation of createEmptyScreenConfig to avoid ESM/CommonJS issues
const createEmptyScreenConfig = () => {
  const generateId = () => Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
                           
  return {
    accordions: [
      {
        id: generateId(),
        title: 'New Accordion',
        isOpen: true,
        sections: [
          {
            id: generateId(),
            title: 'New Section',
            columns: 2,
            widgets: []
          }
        ]
      }
    ],
    metadata: {}
  };
};

const ScreenConfigurations = () => {
  const navigate = useNavigate();
  const [screenConfigurations, setScreenConfigurations] = useState<ScreenConfiguration[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Partial<ScreenConfiguration>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchScreenConfigurations();
  }, []);
  
  const fetchScreenConfigurations = async () => {
    try {
      const data = await screenConfigurationApi.getAll();
      setScreenConfigurations(data);
    } catch (error) {
      console.error('Error fetching screen configurations:', error);
    }
  };
  
  const handleOpenDialog = (screen?: ScreenConfiguration) => {
    if (screen) {
      setCurrentScreen({
        id: screen.id,
        screenKey: screen.screenKey,
        screenName: screen.screenName,
        description: screen.description,
        isActive: screen.isActive
      });
      setIsEditing(true);
    } else {
      setCurrentScreen({ 
        screenKey: '', 
        screenName: '', 
        description: '', 
        isActive: true,
        config: createEmptyScreenConfig()
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentScreen({});
  };
  
  const handleOpenDeleteDialog = (screen: ScreenConfiguration) => {
    setCurrentScreen(screen);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentScreen({});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setCurrentScreen(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };
  
  const handleSubmit = async () => {
    try {
      if (isEditing && currentScreen.id) {
        await screenConfigurationApi.update(currentScreen.id, currentScreen);
      } else {
        const newScreen = await screenConfigurationApi.create(currentScreen);
        // Navigate to screen builder with the new screen ID
        navigate(`/screen-builder/${newScreen.id}`);
        return;
      }
      handleCloseDialog();
      fetchScreenConfigurations();
    } catch (error) {
      console.error('Error saving screen configuration:', error);
    }
  };
  
  const handleDelete = async () => {
    try {
      if (currentScreen.id) {
        await screenConfigurationApi.delete(currentScreen.id);
        handleCloseDeleteDialog();
        fetchScreenConfigurations();
      }
    } catch (error) {
      console.error('Error deleting screen configuration:', error);
    }
  };
  
  const handleNavigateToBuilder = (id: string) => {
    navigate(`/screen-builder/${id}`);
  };
  
  return (
    <Box sx={{ p: 3, pl: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#34568B' }}>Screen Configurations</Typography>
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
              <TableCell>Screen Key</TableCell>
              <TableCell>Screen Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screenConfigurations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No screen configurations found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              screenConfigurations.map((screen) => (
                <TableRow key={screen.id}>
                  <TableCell>{screen.screenKey}</TableCell>
                  <TableCell>{screen.screenName}</TableCell>
                  <TableCell>{screen.description || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={screen.isActive ? 'Active' : 'Inactive'} 
                      color={screen.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(screen.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(screen.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Details">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(screen)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open in Screen Builder">
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleNavigateToBuilder(screen.id)}
                      >
                        <BuildIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(screen)}
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
        <DialogTitle>{isEditing ? 'Edit Screen Configuration' : 'Add New Screen Configuration'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="screenKey"
            label="Screen Key"
            type="text"
            fullWidth
            variant="outlined"
            value={currentScreen.screenKey || ''}
            onChange={handleInputChange}
            required
            helperText="Unique identifier for the screen (e.g., 'product_setup_form')"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="screenName"
            label="Screen Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentScreen.screenName || ''}
            onChange={handleInputChange}
            required
            helperText="Display name for the screen"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={currentScreen.description || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={currentScreen.isActive || false}
                onChange={handleInputChange}
                color="primary"
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Save' : 'Create & Open Builder'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the screen configuration "{currentScreen.screenName}"? This action cannot be undone.
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

export default ScreenConfigurations;
