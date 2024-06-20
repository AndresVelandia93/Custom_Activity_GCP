const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const path = require('path');
const decodeJwt = require(path.join(__dirname, './lib/', 'jwt.js'));
const Pkg = require(path.join(__dirname, '../', 'package.json'));

const app = express();

app.set('port', process.env.PORT || 3000);



// Register middleware that parses the request payload.
app.use(bodyParser.raw({ type: 'application/jwt' }));

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));


app.post('/save', (req, res) => {
  console.log('Save route');
  const decoded = decodeJwt(req.body.toString('utf8'), secret);
  console.log('Decoded JWT:', decoded);
  res.status(200).send('Save');
});

app.post('/publish', (req, res) => {
  console.log('Publish route');
  const decoded = decodeJwt(req.body.toString('utf8'), secret);
  console.log('Decoded JWT:', decoded);
  res.status(200).send('Publish');
});

app.post('/validate', (req, res) => {
  console.log('Validate route');
  const decoded = decodeJwt(req.body.toString('utf8'), secret);
  console.log('Decoded JWT:', decoded);
  res.status(200).send('Validate');
});

app.post('/stop', (req, res) => {
  console.log('Stop route');
  const decoded = decodeJwt(req.body.toString('utf8'), secret);
  console.log('Decoded JWT:', decoded);
  res.status(200).send('Stop');
});


//All logic for execute endpoint and JWT decoding
app.post('/execute', function (req, res) {
  console.log('Execute route');
  const decoded = decodeJwt(req.body.toString('utf8'), secret);
  console.log('Decoded JWT:', decoded);


  /*JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {
    if (err) {
      console.log("ERR: " + err);
      return res.status(401).end();
    }
    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

        //Here you have all you body decoded from JWT, you only have to work with params and manage response (200 or 400)
        createJson (decoded.inArguments);

    } else {
      console.error('inArguments invalid.');
      return res.status(400).end();
    }
  });*/
});

//This function create Json for Web Service
function createJson(decoded) {
  var regex = {};
  var inArguments = decoded;

  var id_corpField, emailField, event_dateField, batchidField, jobidField, accountidField, packageidField;

  inArguments.forEach(function (obj) {
    if (obj.idCorp != undefined) {
      id_corpField = obj.idCorp;
    }
    else if (obj.email != undefined) {
      emailField = obj.email;
    }
    else if (obj.eventDate != undefined) {
      event_dateField = obj.eventDate;
    }
    else if (obj.batchId != undefined) {
      batchidField = obj.batchId;
    }
    else if (obj.jobId != undefined) {
      jobidField = obj.jobId;
    }
    else if (obj.accountId != undefined) {
      accountidField = obj.accountId;
    }
    else if (obj.packageId != undefined) {
      packageidField = obj.packageId;
    }
    else {
      regex['%%' + extractFieldName(Object.keys(obj)) + '%%'] = Object.values(obj).toString();
    }
  });
  var postData = {
    method: 'POST',
    uri: 'https://politica-toques-dot-tot-bi-corp-campautomat-dev.appspot.com/api/Procesar/registrar-cliente',
    headers: {
      'content-type': 'application/json',
      'Accept': 'application/json'
    },
    body:
    {
      "id_corp": id_corpField,
      "email": emailField,
      "event_date": event_dateField,
      "batchid": batchidField,
      "jobid": jobidField,
      "accountid": accountidField,
      "packageid": packageidField
    },
    json: true
  };
  console.log(postData);
  rp(postData).then(function (response) {
    console.log(response);
    console.log("Success Send Heroku");
  })
  .catch(function (err) {
    console.log(err);
    console.log("Failed Send");
  });
}


//This function allows you to extract Field name from In Arguments on body
function extractFieldName(field) {
  var stringField = field.toString();
  var index = stringField.lastIndexOf('.');
  return field.toString().substring(index + 1);
}


app.listen(app.get('port'), () => console.log('App listening on port ' + app.get('port')))
