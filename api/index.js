import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`AnswerHub API running on port ${PORT}`);
  });
}

export default app;
