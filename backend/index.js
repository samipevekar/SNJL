import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import connectMongo from './db/db.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import jobRoutes from './routes/jobRoutes.js';
import recuiterRoutes from './routes/recruiterRoutes.js';
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import { initializeSocket } from './utils/socket.js';
import http from 'http';
config();

const app = express();
const PORT = process.env.PORT || 5000;



// MongoDB connection
connectMongo();
const server = http.createServer(app);
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
app.use('/api/chat', chatRoutes);
app.use('/api/v1/recruiter', recuiterRoutes);
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/friends',friendRoutes)

// Handle 404 routes
app.all('*', (req, res) => {
    res.status(404).send('OPPS!! 404 page not found');
});

// Error handling middleware
app.use(errorMiddleware);
initializeSocket(server);
// Start server
server.listen(PORT, () => console.log(`Server is listening on http://localhost:${PORT}`));
