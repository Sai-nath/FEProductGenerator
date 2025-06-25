import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  useTheme
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PieChart as PieChartIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lineOfBusinessApi, screenConfigurationApi, insuranceProductApi, LineOfBusiness, InsuranceProduct } from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLOB: 0,
    totalScreens: 0,
    totalProducts: 0,
    activeLOB: 0,
    activeScreens: 0,
    activeProducts: 0
  });
  const [lobs, setLobs] = useState<LineOfBusiness[]>([]);
  const [productsByLob, setProductsByLob] = useState<Record<string, InsuranceProduct[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lobs, screens, products] = await Promise.all([
          lineOfBusinessApi.getAll(),
          screenConfigurationApi.getAll(),
          insuranceProductApi.getAll()
        ]);

        setLobs(lobs);
        
        // Organize products by LOB
        const productMap: Record<string, InsuranceProduct[]> = {};
        
        // Initialize with empty arrays for each LOB
        lobs.forEach(lob => {
          productMap[lob.id] = [];
        });
        
        // Group products by LOB ID
        products.forEach(product => {
          if (product.lobId) {
            if (!productMap[product.lobId]) {
              productMap[product.lobId] = [];
            }
            productMap[product.lobId].push(product);
          }
        });
        
        setProductsByLob(productMap);
        
        setStats({
          totalLOB: lobs.length,
          totalScreens: screens.length,
          totalProducts: products.length,
          activeLOB: lobs.filter(lob => lob.isActive).length,
          activeScreens: screens.filter(screen => screen.isActive).length,
          activeProducts: products.filter(product => product.isActive).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleViewProduct = (productId: string) => {
    navigate(`/insurance-products/${productId}`);
  };
  
  const handleEditProduct = (productId: string) => {
    navigate(`/insurance-products/edit/${productId}`);
  };
  
  const handleViewLob = (lobId: string) => {
    navigate(`/lines-of-business/${lobId}`);
  };

  return (
    <Box sx={{ p: 3, pl: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#34568B' }}>
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            background: 'linear-gradient(to right, #34568B, #4a6d9c)',
            boxShadow: '0 2px 8px rgba(52, 86, 139, 0.3)',
            '&:hover': {
              background: 'linear-gradient(to right, #263c61, #34568B)',
              boxShadow: '0 4px 12px rgba(52, 86, 139, 0.4)',
            }
          }}
          startIcon={<DashboardIcon />}
          onClick={() => navigate('/insurance-products/new')}
        >
          New Product
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress sx={{ color: '#34568B' }} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                boxShadow: '5px 5px 10px #e6e6e6, -5px -5px 10px #ffffff',
                border: '1px solid rgba(52, 86, 139, 0.08)'
              }}
            >
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  background: 'rgba(52, 86, 139, 0.08)'
                }}
              >
                <BusinessIcon sx={{ fontSize: 24, color: '#34568B' }} />
              </Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#333', mt: 1 }}>
                Lines of Business
              </Typography>
              <Typography variant="h4" align="center" sx={{ my: 0.5, fontWeight: 700, color: '#34568B' }}>
                {stats.totalLOB}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {stats.activeLOB} Active
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                boxShadow: '5px 5px 10px #e6e6e6, -5px -5px 10px #ffffff',
                border: '1px solid rgba(178, 89, 89, 0.08)'
              }}
            >
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  background: 'rgba(178, 89, 89, 0.08)'
                }}
              >
                <DescriptionIcon sx={{ fontSize: 24, color: '#b25959' }} />
              </Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#333', mt: 1 }}>
                Screen Configurations
              </Typography>
              <Typography variant="h4" align="center" sx={{ my: 0.5, fontWeight: 700, color: '#b25959' }}>
                {stats.totalScreens}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {stats.activeScreens} Active
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                boxShadow: '5px 5px 10px #e6e6e6, -5px -5px 10px #ffffff',
                border: '1px solid rgba(70, 130, 180, 0.08)'
              }}
            >
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  background: 'rgba(70, 130, 180, 0.08)'
                }}
              >
                <PieChartIcon sx={{ fontSize: 24, color: 'steelblue' }} />
              </Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#333', mt: 1 }}>
                Insurance Products
              </Typography>
              <Typography variant="h4" align="center" sx={{ my: 0.5, fontWeight: 700, color: 'steelblue' }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {stats.activeProducts} Active
              </Typography>
            </Paper>
          </Grid>

          {/* Lines of Business Cards */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#34568B' }}>
              Lines of Business
            </Typography>
            
            <Grid container spacing={3}>
              {Object.entries(productsByLob).map(([lobId, products]) => {
                const lob = lobs.find(l => l.id === lobId);
                if (!lob) return null;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={lobId}>
                    <Card sx={{ height: '100%', '& .MuiCardHeader-root': { py: 1, px: 2 }, '& .MuiCardContent-root': { py: 1, px: 2 } }}>
                      <CardHeader
                        title={lob.name}
                        action={
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleViewLob(lobId)}>
                              <VisibilityIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {products.length} Product{products.length !== 1 ? 's' : ''}
                        </Typography>
                        
                        {products.length > 0 ? (
                          <List>
                            {products.slice(0, 3).map(product => (
                              <ListItem key={product.id} disablePadding>
                                <ListItemText 
                                  primary={product.name}
                                  secondary={product.isActive ? 'Active' : 'Inactive'}
                                />
                                <ListItemSecondaryAction>
                                  <Tooltip title="View">
                                    <IconButton edge="end" onClick={() => handleViewProduct(product.id)}>
                                      <VisibilityIcon fontSize="small" sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit">
                                    <IconButton edge="end" onClick={() => handleEditProduct(product.id)}>
                                      <EditIcon fontSize="small" sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                            
                            {products.length > 3 && (
                              <ListItem>
                                <Button 
                                  size="small" 
                                  onClick={() => handleViewLob(lobId)}
                                  sx={{ mt: 1 }}
                                >
                                  View All ({products.length})
                                </Button>
                              </ListItem>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No products in this line of business.
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
              
              {lobs.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" gutterBottom>
                      No lines of business found.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate('/lines-of-business/new')}
                      sx={{ mt: 1 }}
                    >
                      Create Line of Business
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
          
          {/* Quick Start Guide */}
          <Grid item xs={12}>
            <Card sx={{ mt: 2 }}>
              <CardHeader title="Quick Start Guide" />
              <Divider />
              <CardContent>
                <Typography variant="body1" paragraph>
                  Welcome to the Insurance Screen Builder! This application allows you to create and manage dynamic screen configurations for insurance products.
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Getting Started:
                </Typography>
                
                <Typography variant="body2" paragraph>
                  1. Create Lines of Business to categorize your insurance products.
                </Typography>
                
                <Typography variant="body2" paragraph>
                  2. Design Screen Configurations with accordions, sections, and widgets.
                </Typography>
                
                <Typography variant="body2" paragraph>
                  3. Create Insurance Products and associate them with Lines of Business and Screen Configurations.
                </Typography>
                
                <Typography variant="body2">
                  Use the navigation menu on the left to access these features.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
