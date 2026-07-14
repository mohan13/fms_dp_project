import express from 'express';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes.ts';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;

export default app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
