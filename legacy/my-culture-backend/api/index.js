import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// CORS configuration
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://my-culture-frontend-qulfs0x0i-wblack2050-2932s-projects.vercel.app',
      'https://my-culture-frontend-eqjtcqgn2-wblack2050-2932s-projects.vercel.app',
      'https://my-culture-frontend-rf2z6lc97-wblack2050-2932s-projects.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const error = new Error('Not allowed by CORS');
    error.status = 403;
    return callback(error, false);
  }
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.status(418).send("I am a teapot");
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test API route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'API is working'
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ 
    message: 'API is working - this is a test response',
    body: req.body
  });
});

export default app;