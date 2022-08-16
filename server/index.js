const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const path = require('path');
const JWT = require(path.join(__dirname, 'lib', 'jwt.js'));
const Pkg = require(path.join(__dirname, '../', 'package.json'));

const app = express();

app.set('port', process.env.PORT || 3000);



// Register middleware that parses the request payload.
app.use(bodyParser.raw({
  type: 'application/jwt'
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));


//All logic for save endpoint
app.post('/save', function (req, res) {
  res.status(200);
  res.send({
    route: 'save'
  });
});


//All logic for publis endpoint
app.post('/publish', function (req, res) {
  res.status(200);
  res.send({
    route: 'publish'
  });
});


//All logic for validate endpoint
app.post('/validate', function (req, res) {
  res.status(200);
  res.send({
    route: 'validate'
  });
});


//All logic for execute endpoint and JWT decoding
app.post('/execute', function (req, res) {

  JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {
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
  });
});

//This function create Json for Web Service
function createJson(decoded) {
  var regex = {};
  var inArguments = decoded;

  var id_corpField, emailField, event_dateField, batchidField, jobidField, accountidField, packageidField;

  inArguments.forEach(function (obj) {
    console.log(obj);
    if (obj.id_corp != undefined) {
      id_corpField = obj.id_corp;
    }
    else if (obj.email != undefined) {
      emailField = obj.email;
    }
    else if (obj.event_date != undefined) {
      event_dateField = obj.event_date;
    }
    else if (obj.batchid != undefined) {
      batchidField = obj.batchid;
    }
    else if (obj.jobid != undefined) {
      jobidField = obj.jobid;
    }
    else if (obj.accountid != undefined) {
      accountidField = obj.accountid;
    }
    else if (obj.packageid != undefined) {
      packageidField = obj.packageid;
    }
    else {
      regex['%%' + extractFieldName(Object.keys(obj)) + '%%'] = Object.values(obj).toString();
    }
  });
  console.log(regex);
  var postData = {
    method: 'POST',
    uri: 'https://politica-toques-dot-tot-bi-corp-campautomat-dev.appspot.com/api/Procesar/registrar-cliente',
    headers: {
      'content-type': 'application/json',
      'Accept': 'application/json'
    },
    body:
    {
      "id_corp": regex[id_corpField],
      "email": regex[emailField],
      "event_date": regex[event_dateField],
      "batchid": regex[batchidField],
      "jobid": regex[jobidField],
      "accountid": regex[accountidField],
      "packageid": regex[packageidField]
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
