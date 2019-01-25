
const express = require('express')
const router = express.Router()


router.get('/', function (req, res) {
  res.send('new survey');
});

router.get('/:sid', function (req, res) {
  res.send('Survey: ' + req.params.sid);
});

module.exports = router;
