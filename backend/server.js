const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const pool = require('./db'); // Will be used later

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/meals', require('./routes/meal.routes'));

app.get('/', (req, res) => {
  res.send('Meals Tracker API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
