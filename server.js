// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');

const app = express();

// Read allowed origin from env (set this on Render dashboard): e.g. https://linedcolt.github.io
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Always set CORS headers and respond to OPTIONS preflight
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // If you need to allow cookies/auth: uncomment the next line and set ALLOWED_ORIGIN to exact origin
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    // Preflight request — no body expected
    return res.sendStatus(204);
  }
  next();
});

app.use(bodyParser.json());

// Pusher init (env vars must be set on the host)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'server up' });
});

app.post('/message', (req, res) => {
  const { name = 'Anon', text = '' } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, error: 'empty text' });

  const payload = { name, text, ts: Date.now() };
  pusher.trigger('public-chat', 'new-message', payload)
    .then(() => res.json({ ok: true }))
    .catch(err => {
      console.error('Pusher error', err);
      res.status(500).json({ ok: false, error: err.message || 'pusher error' });
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on ${port}`));
