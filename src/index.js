
const express = require('express');
const app = express();
const port = (process.env.NODE_ENV === 'production') ? 80 : 3000;

app.use('/', require('./routes/basic'));
app.use('/survey', require('./routes/survey'));

app.listen(port);
