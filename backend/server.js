import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';


connectDB().catch(console.error);


if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`AnswerHub API running on port ${PORT}`);
  });
}


export default app;