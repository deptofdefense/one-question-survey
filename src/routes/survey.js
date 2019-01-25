
const express = require('express');
const md5 = require('md5');
const fs = require('fs-extra');
const router = express.Router();

const SALT = '67gu4evsdgh';

router.post('/', async function (req, res) {
  const data = {
    createTime: Date.now(),
    responses: [],
    question: req.body.question,
    answers: req.body.answers
  };
  
  data.id = md5(SALT + JSON.stringify(data) + Date.now());
  data.code = data.id.substr(0,5);
  
  try {
    await fs.outputFile(`data/${data.code}.json`, JSON.stringify(data));
    res.send(`Wrote new survey file (${data.id}): ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(err);
    res.send('oops<br><br>' + err.message);
  }
});

router.get('/:code', function (req, res) {
  try {
    const data = require(`../../data/${req.params.code}.json`);
    res.render('submit', { title: 'One Question Survey', data: {
      code: data.code,
      question: data.question,
      answers: data.answers
    } });
    
  } catch(err) {
    console.error(err);
    res.send('Unable to find survey: ' + req.params.code);
  }
});

module.exports = router;
