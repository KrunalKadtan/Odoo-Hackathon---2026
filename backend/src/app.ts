import express from 'express';
import cors from 'cors';

import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import departmentRoutes from './modules/departments/department.routes.js';
import userRoutes from './modules/users/user.routes.js';
import assetRoutes from './modules/assets/asset.routes.js';
import allocationRoutes from './modules/allocations/allocation.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/allocations', allocationRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
