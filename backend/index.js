import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import connectMongo from './db/db.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import jobRoutes from './routes/jobRoutes.js';
import employerRoutes from './routes/hiringRoute.js';
import userRoutes from './routes/workerRoute.js'

config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
connectMongo();

// Middlewares
app.use(express.json({limit:"20mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

// All api routes
app.use('/api/jobs', jobRoutes);
app.use('/api/v1/employer', employerRoutes);
app.use('/api/v1/user',userRoutes)

// Handle 404 routes
app.all('*', (req, res) => {
    res.status(404).send('OPPS!! 404 page not found');
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => console.log(`Server is listening on http://localhost:${PORT}`));
