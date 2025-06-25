
import { Box, Typography, Paper } from '@mui/material';

const TestPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">Test Page</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          If you can see this content, React rendering is working correctly.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestPage;
