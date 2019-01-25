
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = (process.env.NODE_ENV === 'production') ? 80 : 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.use('/', require('./routes/basic'));
app.use('/survey', require('./routes/survey'));

app.listen(port);
