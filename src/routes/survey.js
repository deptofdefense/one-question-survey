
const express = require('express');
const md5 = require('md5');
const fs = require('fs-extra');
const router = express.Router();

const SALT = '67gu4evsdgh';
const whitelist = /[^a-zA-Z0-9\-\. \,\(\)]/g;

router.post('/', async function (req, res) {
  const data = {
    createTime: Date.now(),
    responses: [],
    question: req.body.question.replace(whitelist, ''),
    answers: req.body.answers.map((a) => { return a.replace(whitelist, ''); })
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

router.post('/submit/:code', async function (req, res) {
  try {
    const data = require(`../../data/${req.params.code}.json`);
    
    const response = {
      name: req.body.name.replace(whitelist, ''),
      client: req.body.client.replace(/[^a-f0-9]/g, ''),
      answer: req.body.response.replace(whitelist, ''),
      responseTime: Date.now(),
      ip: req.connection.remoteAddress
    };
    
    let alreadyResponded = false;
    data.responses
      .filter((r) => { return r.client === response.client; })
      .forEach((r) => {
        const prevDate = (new Date(r.responseTime)).toISOString().split(/T/)[0];
        const resDate = (new Date(response.responseTime)).toISOString().split(/T/)[0];
        if (prevDate === resDate) {
          alreadyResponded = true;
        }
      });
    
    if (alreadyResponded) {
      return res.redirect(`/survey/${data.code}?message=${encodeURIComponent('Looks like you already responded today!')}`);
    }
    
    data.responses.push(response);
    await fs.outputFile(`data/${data.code}.json`, JSON.stringify(data));
    
    res.redirect(`/survey/${data.code}?message=${encodeURIComponent('Your response has been recorded!')}`);
    
  } catch(err) {
    console.error(err);
    res.send('Unable to submit response :(');
  }
});

module.exports = router;
