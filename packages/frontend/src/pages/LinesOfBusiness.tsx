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
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { lineOfBusinessApi, LineOfBusiness } from '../services/api';

const LinesOfBusiness = () => {
  const [linesOfBusiness, setLinesOfBusiness] = useState<LineOfBusiness[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentLOB, setCurrentLOB] = useState<Partial<LineOfBusiness>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchLinesOfBusiness();
  }, []);
  
  const fetchLinesOfBusiness = async () => {
    try {
      const data = await lineOfBusinessApi.getAll();
      setLinesOfBusiness(data);
    } catch (error) {
      console.error('Error fetching lines of business:', error);
    }
  };
  
  const handleOpenDialog = (lob?: LineOfBusiness) => {
    if (lob) {
      setCurrentLOB(lob);
      setIsEditing(true);
    } else {
      setCurrentLOB({ name: '', description: '', isActive: true });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentLOB({});
  };
  
  const handleOpenDeleteDialog = (lob: LineOfBusiness) => {
    setCurrentLOB(lob);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentLOB({});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setCurrentLOB(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };
  
  const handleSubmit = async () => {
    try {
      if (isEditing && currentLOB.id) {
        await lineOfBusinessApi.update(currentLOB.id, currentLOB);
      } else {
        await lineOfBusinessApi.create(currentLOB);
      }
      handleCloseDialog();
      fetchLinesOfBusiness();
    } catch (error) {
      console.error('Error saving line of business:', error);
    }
  };
  
  const handleDelete = async () => {
    try {
      if (currentLOB.id) {
        await lineOfBusinessApi.delete(currentLOB.id);
        handleCloseDeleteDialog();
        fetchLinesOfBusiness();
      }
    } catch (error) {
      console.error('Error deleting line of business:', error);
    }
  };
  
  return (
    <Box sx={{ p: 3, pl: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#34568B' }}>Lines of Business</Typography>
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linesOfBusiness.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No lines of business found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              linesOfBusiness.map((lob) => (
                <TableRow key={lob.id}>
                  <TableCell>{lob.name}</TableCell>
                  <TableCell>{lob.description || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={lob.isActive ? 'Active' : 'Inactive'} 
                      color={lob.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(lob.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(lob.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(lob)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(lob)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Line of Business' : 'Add New Line of Business'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentLOB.name || ''}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={currentLOB.description || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={currentLOB.isActive || false}
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the line of business "{currentLOB.name}"? This action cannot be undone.
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

export default LinesOfBusiness;
