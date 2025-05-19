const express = require('express');
const path = require('path');
const winston = require('winston');
const app = express();
const PORT = process.env.PORT || 3000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'calculator-app' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Calculator API
app.post('/api/calculate', (req, res) => {
  try {
    const { num1, num2, operation } = req.body;
    
    // Validate inputs
    if (num1 === undefined || num2 === undefined || !operation) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    let result;
    switch (operation) {
      case '+':
        result = Number(num1) + Number(num2);
        break;
      case '-':
        result = Number(num1) - Number(num2);
        break;
      case '*':
        result = Number(num1) * Number(num2);
        break;
      case '/':
        if (Number(num2) === 0) {
          logger.error('Division by zero attempt');
          return res.status(400).json({ error: 'Cannot divide by zero' });
        }
        result = Number(num1) / Number(num2);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    logger.info(`Calculation: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ result });
  } catch (error) {
    logger.error('Error in calculation', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Calculator App running on port ${PORT}`);
});