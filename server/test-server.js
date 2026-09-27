const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
app.use(express.json());
app.post('/test', async (req, res) => {
  try {
    const { role } = req.body;
    console.log('ROLE IS:', role, 'TYPE:', typeof role);
    const user = new User({ name: 'Test', email: 'test1000@t.com', password: 'password', role: role || 'public' });
    await user.validate();
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});
mongoose.connect('mongodb+srv://rajibulhazari786_db_user:L6mUPhaLfIYKOqMg@cluster0.1ds9ek0.mongodb.net/caseintel').then(() => {
  app.listen(5001, () => console.log('Listening on 5001'));
});
