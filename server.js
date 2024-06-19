import express from 'express';

import router from './routes/index';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(router);
app.listen(PORT, () => {
  console.log(`API available on localhost port ${PORT}`);
});

export default app;
