import { initApp } from '@app.js';
import 'dotenv/config';

const app = initApp();
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
