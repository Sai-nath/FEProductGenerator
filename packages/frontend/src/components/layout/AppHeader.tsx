import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface AppHeaderProps {
  toggleSidebar: () => void;
}

const AppHeader = ({ toggleSidebar }: AppHeaderProps) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme => theme.zIndex.drawer + 1,
        background: 'linear-gradient(to right, #34568B, #4a6d9c)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            } 
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          Insurance Screen Builder
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit"
            sx={{ 
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              } 
            }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
