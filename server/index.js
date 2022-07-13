const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const path = require('path');
const JWT = require(path.join(__dirname, 'lib', 'jwt.js'));
const Pkg = require(path.join(__dirname, '../', 'package.json'));

const app = express();
let activity = null;
const connection = new Postmonger.Session();

app.set('port', process.env.PORT || 3000);


// Register middleware that parses the request payload.
app.use(bodyParser.raw({
  type: 'application/jwt'
}));


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
        res.status(200);
        res.send({
            route: 'execute'
        });
    } else {
      console.error('inArguments invalid.');
      return res.status(400).end();
    }



  });


 

});


//This function allows you to extract Field name from In Arguments on body
function extractFieldName(field) {
  var stringField = field.toString();
  var index = stringField.lastIndexOf('.');
  return field.toString().substring(index + 1);
}


app.listen(app.get('port'), () => console.log('App listening on port ' + app.get('port')))

function requestedInteraction(payload) {
  console.log('-------- requestedInteraction --------');
  console.log('payload\n', JSON.stringify(payload, null, 4));
  console.log('requestInteraction', payload);
  console.log('--------------------------------------');

  let selectedValue;

  // determine the selected item (if there is one)
  if(activity.arguments.execute.inArguments) {
      const existingSelection = activity.arguments.execute.inArguments[0].discount ?? activity.arguments.execute.inArguments[0].discountCode;

      if(existingSelection.split('.').length == 3) {
          selectedValue = existingSelection.split('.')[1];
      }
  }

  // populate the select dropdown.
  const selectElement = document.getElementById('discount-code');

  payload.activities.forEach(a => {
      if(a.schema && a.schema.arguments && a.schema.arguments.execute &&
          a.schema.arguments.execute.outArguments && a.schema.arguments.execute.outArguments.length > 0) {
          a.schema.arguments.execute.outArguments.forEach(inArg => {
              if(inArg.discountCode) {
                  let option = document.createElement("option");
                  option.text = `${a.name} - (${a.key})`;
                  option.value = a.key;
                  selectElement.add(option);
              }
          });
      }
  });

  // Display the warning if there is an issue, otherwise, display the
  if(selectElement.childElementCount == 0) {
      document.getElementById('main-form').style.display = 'hidden';
      document.getElementById('warning').style.display = 'block';
  } else {
      document.getElementById('main-form').style.display = 'block';
      document.getElementById('warning').style.display = 'hidden';

      // if we have a previously selected value, repopulate that value.
      if(selectedValue) {
          const selectOption = selectElement.querySelector(`[value='${selectedValue}']`);

          if (selectOption) {
              selectOption.selected = true;
          } else {
              console.log('Could not select value from list', `[value='${selectedValue}]'`);
          }
      }

      // let journey builder know the activity has changes
      connection.trigger('setActivityDirtyState', true);
  }
}
