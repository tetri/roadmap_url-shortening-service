import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import urlRoutes from './routes/url';
import { errorHandler } from './middlewares/error-handler';
import * as urlController from './controllers/url';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', urlRoutes);

app.get('/:shortCode', urlController.redirectToOriginalUrl);

app.use(errorHandler);

export default app;
