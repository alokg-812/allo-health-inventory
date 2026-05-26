require('dotenv').config();

const app = require('./app');
const { startExpiryJob } = require('./utils/expiryJob');

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  startExpiryJob();
});
