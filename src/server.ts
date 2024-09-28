import express, { Application } from 'express';
import exampleRoute from './routes/route';

const app: Application = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api', exampleRoute);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
