const express = require('express');

const app = express();

const mongoose = require('mongoose');

const sauceRoutes = require('./routes/sauce');

const userRoutes = require('./routes/user');

const path = require('path');

mongoose.connect('mongodb+srv://astridsen:vTaIrNurmjXOgfIx@cluster0.1jpgm8m.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Successful connection to MongoDB !'))
  .catch(() => console.log('Connection to MongoDB failed !'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;

