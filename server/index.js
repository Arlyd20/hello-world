import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Hello World API listening on http://localhost:${port}`));
