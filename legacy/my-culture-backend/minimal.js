import express from 'express';

const app = express();

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

export default app;