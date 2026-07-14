import app from './app.ts';
import { env } from './config/env.ts';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
