import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Layout components
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';

// Pages
import Dashboard from './pages/Dashboard';
import LinesOfBusiness from './pages/LinesOfBusiness';
import ScreenConfigurations from './pages/ScreenConfigurations';
import ScreenBuilder from './pages/ScreenBuilder';
import InsuranceProducts from './pages/InsuranceProducts';
import FormTest from './pages/FormTest';
import NotFound from './pages/NotFound';
import TestPage from './pages/TestPage';

const theme = createTheme({
  palette: {
    primary: {
      light: '#5c7da0',
      main: '#34568B',
      dark: '#263c61',
      contrastText: '#fff',
    },
    secondary: {
      light: '#c77f7f',
      main: '#b25959',
      dark: '#8e4747',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppHeader toggleSidebar={toggleSidebar} />
        <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          <AppSidebar open={sidebarOpen} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              pl: 0,
              pt: 3,
              mt: 2,
              width: '100%',
              height: '100%',
              overflow: 'auto',
              boxSizing: 'border-box',
              transition: theme => theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lines-of-business" element={<LinesOfBusiness />} />
            <Route path="/screen-configurations" element={<ScreenConfigurations />} />
            <Route path="/screen-builder/:id?" element={<ScreenBuilder />} />
            <Route path="/insurance-products" element={<InsuranceProducts />} />
            <Route path="/form-test" element={<FormTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
