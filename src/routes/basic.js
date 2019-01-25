
const express = require('express')
const router = express.Router()


router.get('/', function (req, res) {
  res.render('home', { title: 'One Question Survey', message: 'This is a 1 question survey.' });
});

module.exports = router;
