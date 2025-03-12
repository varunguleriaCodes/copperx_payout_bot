import express from 'express';

export function createServer() {
  const app = express();

  app.get('/', (req, res) => {
    res.status(200).send('OK');
  });

  app.use((req, res) => {
    res.status(404).send('Not Found');
  });

  return app;
}
