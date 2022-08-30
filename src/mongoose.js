const mongoose = require('mongoose');

require('dotenv').config();

module.export = mongoose.connect(process.env.MongoDB_URI,
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Successful connection to MongoDB !'))
    .catch(() => console.log('Connection to MongoDB failed !'));