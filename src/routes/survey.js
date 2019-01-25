
const express = require('express');
const md5 = require('md5');
const fs = require('fs-extra');
const router = express.Router();

router.post('/', async function (req, res) {
  const hash = md5(JSON.stringify(req.body) + Date.now()).substr(0,5);
  const data = Object.assign({ id: hash, createTime: Date.now() }, req.body);
  
  try {
    await fs.outputFile(`data/${hash}.json`, JSON.stringify(data));
    res.send(`Wrote new survey file (${hash}): ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(err);
    res.send('oops<br><br>' + err.message);
  }
});

router.get('/:sid', function (req, res) {
  res.send('Survey: ' + req.params.sid);
});

module.exports = router;
