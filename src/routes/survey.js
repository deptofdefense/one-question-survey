
const express = require('express');
const md5 = require('md5');
const fs = require('fs-extra');
const router = express.Router();

const SALT = '67gu4evsdgh';
const whitelist = /[^a-zA-Z0-9\-\. \,\(\)]/g;
const port = (process.env.NODE_ENV === 'production') ? 80 : 3000;
const clientIterator = 1;

router.post('/', function (req, res) {
  const data = {
    createTime: Date.now(),
    responses: [],
    question: req.body.question.replace(whitelist, ''),
    answers: req.body.answers.map((a) => { return a.replace(whitelist, ''); })
  };
  
  data.id = md5(SALT + JSON.stringify(data) + Date.now());
  data.code = data.id.substr(0,5);
  
  fs.outputFile(`data/${data.code}.json`, JSON.stringify(data))
    .then(() => {
      res.redirect(`/survey/${data.code}/admin/${data.id.substr(6,5)}?message=${encodeURIComponent('Your survey has been created!')}`);
    })
    .catch(err => {
      console.error(err);
      res.send('oops<br><br>' + err.message);
    });
});

router.get('/:code/admin/:admin', function (req, res) {
  const domain = `${req.protocol}://${req.hostname}${(port === 3000) ? ':3000' : ''}`;
  try {
    const data = require(`../../data/${req.params.code}.json`);
    
    if (data.id.substr(6,5) === req.params.admin) {
      return res.render('review', {
        title: `Survey ${req.params.code}`,
        data: {
          shareUrl: `${domain}/survey/${data.code}`,
          adminUrl: `${domain}/survey/${data.code}/admin/${data.id.substr(6,5)}`,
          question: data.question,
          answers: data.answers,
          responses: data.responses
        }
      });
    }
    
    throw new Error('Admin code does not match');
    
  } catch(err) {
    console.error(err);
    res.send('Unable to find survey.');
  }
});

router.get('/:code', function (req, res) {
  const client = md5(req.connection.remoteAddress + clientIterator + Date.now());
  
  try {
    const data = require(`../../data/${req.params.code}.json`);
    res.render('submit', { title: `Survey ${data.code}`, data: {
      code: data.code,
      question: data.question,
      answers: data.answers,
      client: client
    } });
    
  } catch(err) {
    console.error(err);
    res.send('Unable to find survey: ' + req.params.code);
  }
});

router.post('/submit/:code', function (req, res) {
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
  fs.outputFile(`data/${data.code}.json`, JSON.stringify(data))
    .then(() => {
      res.redirect(`/survey/${data.code}?message=${encodeURIComponent('Your response has been recorded!')}`);
    })
    .catch(err => {
      console.error(err);
      res.send('Unable to submit response :(');
    });
});


module.exports = router;
