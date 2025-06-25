import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { lineOfBusinessRoutes } from './routes/lineOfBusinessRoutes';
import { screenConfigurationRoutes } from './routes/screenConfigurationRoutes';
import { insuranceProductRoutes } from './routes/insuranceProductRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/lines-of-business', lineOfBusinessRoutes);
app.use('/api/screen-configurations', screenConfigurationRoutes);
app.use('/api/insurance-products', insuranceProductRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
