const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const path = require('path');
const https = require('https');
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
        var inArgsReqPayload = decoded.inArguments;

        var post_data = JSON.stringify({
          "id_corp": inArgsReqPayload[0].idCorp,
          "email": inArgsReqPayload[1].email,
          "event_date": inArgsReqPayload[2].eventDate,
          "batchid": inArgsReqPayload[3].batchId,
          "jobid": inArgsReqPayload[4].jobId,
          "accountid": inArgsReqPayload[5].accountId,
          "packageid": inArgsReqPayload[6].packageId
        });

        var options = {
          'hostname': 'https://politica-toques-dot-tot-bi-corp-campautomat-dev.appspot.com/api/Procesar/registrar-cliente',
          'path': '/',
          'method': 'POST',
          'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
          }
        };
        console.log(post_data);
        console.log(options);
        var promise = httpRequestGCP(options, post_data);

        promise
        .then(function(resultado) {
          console.log(resultado);
          res.status(200).send({resultado: 'Exitoso'});
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).end();
        });
    } else {
      console.error('inArguments invalid.');
      return res.status(400).end();
    }
  });
});

//This function execute external web service of GCP
function httpRequestGCP(params, postData) {
  return new Promise(function(resolve, reject) {
    var req = https.request(params, function(res) {
        // reject on bad status
        if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error('statusCode: ' + res.statusCode));
        }
        // write result
        var resultado = [];
        res.on('data', function(chunk) {
          resultado.push(chunk);
      });
        // resolve on end
        res.on('end', function() {
            try {
              resultado = JSON.parse(Buffer.concat(resultado).toString());
            } catch(e) {
                reject(e);
            }
            resolve(resultado);
        });
    });
    // reject on request error
    req.on('error', function(err) {
        // This is not a "Second reject", just a different sort of failure
        reject(err);
    });
    if (postData) {
        req.write(postData);
    }
    // IMPORTANT
    req.end();
  });
}

//This function allows you to extract Field name from In Arguments on body
function extractFieldName(field) {
  var stringField = field.toString();
  var index = stringField.lastIndexOf('.');
  return field.toString().substring(index + 1);
}


app.listen(app.get('port'), () => console.log('App listening on port ' + app.get('port')))
