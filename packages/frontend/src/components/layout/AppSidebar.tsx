import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import InventoryIcon from '@mui/icons-material/Inventory';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';

interface AppSidebarProps {
  open: boolean;
}

const AppSidebar = ({ open }: AppSidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Lines of Business', icon: <CategoryIcon />, path: '/lines-of-business' },
    { text: 'Screen Configurations', icon: <DesignServicesIcon />, path: '/screen-configurations' },
    { text: 'Insurance Products', icon: <InventoryIcon />, path: '/insurance-products' },
    { text: 'Form Test', icon: <DynamicFormIcon />, path: '/form-test' },
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? 240 : 0,
        flexShrink: 0,
        position: 'relative',
        transition: theme => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          position: 'absolute',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar sx={{ background: 'linear-gradient(to right, #34568B, #4a6d9c)' }} />
      <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: '0 24px 24px 0',
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(52, 86, 139, 0.12)',
                color: '#34568B',
                '&:hover': {
                  backgroundColor: 'rgba(52, 86, 139, 0.18)',
                },
                '& .MuiListItemIcon-root': {
                  color: '#34568B',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#34568B' : 'rgba(0, 0, 0, 0.54)' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AppSidebar;
