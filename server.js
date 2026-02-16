// server.js (Node + Express)
// npm i express pusher body-parser cors
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const cors = require('cors');

const app = express();
app.use(cors()); // restrict in production
app.use(bodyParser.json());

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

app.post('/message', (req, res) => {
  const { name = 'Anon', text = '' } = req.body || {};
  if (!text) return res.status(400).send({ok:false});
  const payload = { name, text, ts: Date.now() };
  // broadcast to the 'public-chat' channel, event 'new-message'
  pusher.trigger('public-chat', 'new-message', payload)
    .then(() => res.json({ok:true}))
    .catch(err => res.status(500).json({ok:false, error: err.message}));
});

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('listening on', port));
