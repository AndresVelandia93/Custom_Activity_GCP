define(['postmonger'], (Postmonger) => {


    const connection = new Postmonger.Session();

    const steps = [
        { "label": "Step 1", "key": "step1" },
        { "label": "Step 2", "key": "step2" }
    ];

    var currentStep = steps[0].key;

    const inArguments = [];



    //Index Tag Id's



    //Global Variable
    let eventDefinitionKey = null;
    let payload = {};
    var schema = {};


    //Input Names


    $(window).ready(onRender);


    connection.on('initActivity', initialize);


    connection.on('requestedTriggerEventDefinition', onRequestEventDefinition);


    connection.on('requestedSchema', onRequestSchema);


    connection.on('clickedNext', onClickedNext);


    connection.on('clickedBack', onClickedBack);


    connection.on('gotoStep', onGotoStep);



    //This function executes on render the page
    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestSchema');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }



    
    function initialize(data) {
        console.log("Datos: ", JSON.stringify(data));
        if(data) {
            payload = data;
            //var setobjectID = payload["arguments"].execute.inArguments[0].objectID;
            //$("#id_corp").val(setobjectID);
        }
    }


    function onClickedNext() {
        if (currentStep.key === 'step2') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }


    function onClickedBack() {
        connection.trigger('prevStep');
    }


    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }


    function onRequestSchema(data) {
        schema = data['schema'];
        //console.log('*** Schema ***', JSON.stringify(data['schema']));
        
        schema.forEach(element => {
            var option = document.createElement("option");
            option.value = element.key;
            option.text = element.name;
            
            $('#id_corp').append($('<option>', {value: element.key, text: element.name}));
            $('#email').append($('<option>', {value: element.key, text: element.name}));
            $('#event_date').append($('<option>', {value: element.key, text: element.name}));
            $('#batchid').append($('<option>', {value: element.key, text: element.name}));
            $('#jobid').append($('<option>', {value: element.key, text: element.name}));
            $('#accountid').append($('<option>', {value: element.key, text: element.name}));
            $('#packageid').append($('<option>', {value: element.key, text: element.name}));
        });
        //fillPlaceholderList(schema);    
    }

    
    function onRequestEventDefinition(eventDefinition) {
        eventDefinitionKey = eventDefinition.eventDefinitionKey;
    }

    //Function for finish process and save set up
    function save() {
        //Armar el JSON
        configureInArguments();
        console.log("ON SAVE: " + JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }

    //Function for set up payload to send to backend service (execute)
    function configureInArguments() {
        var inArguments = [];
        if (schema !== undefined && schema.length > 0) {
            for (var i in schema) {
                var field = schema[i];
                if (isEventDataSourceField(field)) {
                    var fieldName = extractFieldName(field);
                    var prefixedFieldName = 'DataGCP_' + fieldName;
                    saveFieldToInArguments(field, prefixedFieldName, inArguments);
                    
                }
            }
        }

        //This param should be setted up always to true when finish to enable custom activity
        payload['metaData'].isConfigured = true; 

        payload['arguments'].execute.inArguments = inArguments;
    }



    function extractFieldName(field) {
        var index = field.key.lastIndexOf('.');
        return field.key.substring(index + 1);
    }

    function isEventDataSourceField(field) {
        return !field.key.startsWith('Interaction.');
    }

    function saveFieldToInArguments(field, fieldName, inArguments) {
        var obj = {};
        obj[fieldName] = "{{" + field.key + "}}";
        inArguments.push(obj);
    }


    function showStep(step) {
        currentStep = step;

        $('.step').hide();

        if (step == null) {
            $('#step1').show();
            connection.trigger('updateButton', {
                button: 'next',
                text: 'Next',
                enabled: validateSelectors() 
            });
            connection.trigger('updateButton', {
                button: 'back',
                visible: false
            });
        }

        switch(step.key) {

            case 'step1':
            $('#step1').show();
            connection.trigger('updateButton', {
                button: 'next',
                text: 'Next',
                enabled: true
            });
            connection.trigger('updateButton', {
                button: 'back',
                visible: false
            });
            break;

            case 'step2':
            $('#step2').show();
            connection.trigger('updateButton', {
                button: 'back',
                visible: true
            });
            connection.trigger('updateButton', {
                button: 'next',
                text: 'Done',
                visible: true
            });
            break;    
        }
        
    }
});



