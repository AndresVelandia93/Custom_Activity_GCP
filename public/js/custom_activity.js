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
        //Funcion que carga todo el payload de la custom activity en una variable
        if(data) {
            payload = data;
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
        //Funcion que permite obtener el esquema de la fuente de datos del Journey
        //console.log('*** Schema ***', JSON.stringify(data));
        schema = data['schema'];
        schema.forEach(element => {              
            var option = {value: "{{" + element.key + "}}", text: element.name};
            $('#idCorp').append($('<option>', option));
            $('#email').append($('<option>', option));
            $('#eventDate').append($('<option>', option));
            $('#batchId').append($('<option>', option));
            $('#jobId').append($('<option>', option));
            $('#accountId').append($('<option>', option));
            $('#packageId').append($('<option>', option));
        });

        var inArgs = payload["arguments"].execute.inArguments;
        for(var i = 0; i < inArgs.length; i++) {
			var inArg = inArgs[i];
			var inArgKey = Object.keys(inArg)[0];
			if(document.getElementById(inArgKey)) $('#' + inArgKey).val(inArgs[i][inArgKey]); 
		} 
    }

    function onRequestEventDefinition(eventDefinition) {
        eventDefinitionKey = eventDefinition.eventDefinitionKey;
    }

    //Function for finish process and save Set Up
    function save() {
        configureInArguments();
        //console.log("ON SAVE: " + JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }

    //Function for set up payload to send to backend service (execute)
    function configureInArguments() {
        var inArguments = [];

        if (schema !== undefined && schema.length > 0) {
            // next, save each input field as an inArgument in the inArguments arr
            var inputEls = document.getElementsByTagName('select');
            // insert one argument into inArguments at a time
            for(var i = 0; i < inputEls.length; i++) {
                var fieldName = inputEls[i].id;
                var fieldKey = inputEls[i].value;
                saveFieldToInArguments(fieldKey, fieldName, inArguments);
            }
        }

        //This param should be setted up always to true when finish to enable custom activity
        payload['metaData'].isConfigured = true; 

        payload['arguments'].execute.inArguments = inArguments;
    }


    function isEventDataSourceField(field) {
        return !field.key.startsWith('Interaction.');
    }

    function saveFieldToInArguments(fieldKey, fieldName, inArguments) {
        var obj = {};
        obj[fieldName] = fieldKey;
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



