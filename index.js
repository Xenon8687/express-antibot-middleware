const express = require('express');
const expressip = require('express-ip');
const IPM = require('./middlewares/LocalIP');
const Geo = require('./middlewares/Geo')
const AntiBot = require('./middlewares/AntiBot');

const app = express();

app.use(expressip().getIpInfoMiddleware);
app.use(IPM);
app.use(Geo);
app.use(AntiBot);

app.get('/api/hello', (req, res) => {
  res.send('Hello you too.');
});

app.listen(3000);