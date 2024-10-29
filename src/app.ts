import express from 'express';
import projectRoutes from './routes/projectRoutes'
import cors from 'cors';
import exp from 'constants';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', projectRoutes);

export default app;
