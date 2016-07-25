(function () {
    'use strict';
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var userOutput;

    app.onactivated = function (args) {
        document.getElementById("resultTextArea").innerText += "Gettin' there...";
        if (args.detail.kind === activation.ActivationKind.launch) {
            AudioCapturePermissions.requestMicrophonePermission().then(function (available) {
                if (available) {
                    document.getElementById("resultTextArea").innerText = "Microphone available";
                    var defaultLang = Windows.Media.SpeechRecognition.SpeechRecognizer.systemSpeechLanguage;
                    initializeRecognizer(defaultLang);//add default lang
                    // initializeLanguageDropdown();

                    //btnListen.addEventListener("click", listenFn, false); 
                    btnListenUI.addEventListener("click", listenUIFn, false);
                    //languageSelect.addEventListener("change", setLanguageFunction, false);

                    var rcns = Windows.ApplicationModel.Resources.Core;
                    context = new rcns.ResourceContext();
                    context.languages = new Array(defaultLang.languageTag);
                    resourceMap = rcns.ResourceManager.current.mainResourceMap.getSubtree('LocalizationSpeechResources');
                } else {
                    document.getElementById("resultTextArea").innerText += "Microphone not available";
                }
            });
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                // TODO: Your code here.
            }));
        }
    };
    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
        // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
        // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
    };
    app.start();

    var recognizer;

    // localization resources
    var context;
    var resourceMap;

    function initializeRecognizer(language) {
        /// <summary>
        /// Initialize speech recognizer and compile constraints.
        /// </summary>
        if (typeof recognizer !== 'undefined') {
            recognizer = null;
        }

        recognizer = Windows.Media.SpeechRecognition.SpeechRecognizer(language);

        // Provide feedback to the user about the state of the recognizer.
        recognizer.addEventListener('statechanged', onSpeechRecognizerStateChanged, false);

        // Compile the dictation topic constraint, which optimizes for dictated speech.
        var dictationConstraint = new Windows.Media.SpeechRecognition.SpeechRecognitionTopicConstraint(Windows.Media.SpeechRecognition.SpeechRecognitionScenario.dictation, "dictation");
        recognizer.constraints.append(dictationConstraint);

        recognizer.compileConstraintsAsync().done(
            function (result) {
                // Check to make sure that the constraints were in a proper format and the recognizer was able to compile them.
                if (result.status != Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.success) {
                    //btnListen.disabled = true;
                    btnListenUI.disabled = true;
                    // Let the user know that the grammar didn't compile properly.
                    speechRecognizerUnsuccessful(result.status);
                }
                else {
                    //btnListen.disabled = false;
                    btnListenUI.disabled = false;
                }
            }
        );
    }

    function listenUIFn() {
        /// <summary>
        /// Uses the recognizer constructed earlier to listen for speech from the user before displaying 
        /// it back on the screen. Uses the built-in speech recognition UI.
        /// </summary>
        //btnListen.disabled = true;
        btnListenUI.disabled = true;
        //errorMessage("");

        // Start recognition.
        try {
            recognizer.recognizeWithUIAsync().then(
                function (result) {
                    // If successful, display the recognition result.
                    if (result.status == Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.success) {
                        resultTextArea.innerText = result.text;
                        document.getElementById("resultsID").innerText = result.text;

                        userOutput = result.text;
                        outputFunction(userOutput);    
                    }
                    else {
                        speechRecognizerUnsuccessful(result.status);
                    }
                },
                function (error) {
                    errorMessage(error.message);
                }
            ).done(
                function (result) {
                    //btnListen.disabled = false;
                    btnListenUI.disabled = false;
                }
            );
        }
        catch (exception) {
            errorMessage(exception.message);

            //btnListen.disabled = false;
            btnListenUI.disabled = false;
        }
    }

    function displayMessage(text) {
        /// <summary>
        /// Sets the status area with the message details and color.
        /// </summary>
        statusMessage.innerText = text;
    }

    function errorMessage(text) {
        /// <summary>
        /// Sets the specified text area with the error message details.
        /// </summary>
        if (typeof errorTextArea !== "undefined") {
            errorTextArea.innerText = text;
        }
    }

    function onSpeechRecognizerStateChanged(eventArgs) {
        /// <summary>
        /// Looks up the state text and displays the message to the user.
        /// </summary>
        switch (eventArgs.state) {
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.idle: {
                displayMessage("Speech recognizer state: idle");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.capturing: {
                displayMessage("Speech recognizer state: capturing");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.processing: {
                displayMessage("Speech recognizer state: processing");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.soundStarted: {
                displayMessage("Speech recognizer state: soundStarted");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.soundEnded: {
                displayMessage("Speech recognizer state: soundEnded");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.speechDetected: {
                displayMessage("Speech recognizer state: speechDetected");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognizerState.paused: {
                displayMessage("Speech recognizer state: paused");
                break;
            }
            default: {
                break;
            }
        }
    }

    function speechRecognizerUnsuccessful(resultStatus) {
        /// <summary>
        /// Looks up the error text and displays the message to the user.
        /// </summary>
        switch (resultStatus) {
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.audioQualityFailure: {
                errorMessage("Speech recognition error: audioQualityFailure");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.grammarCompilationFailure: {
                errorMessage("Speech recognition error: grammarCompilationFailure");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.grammarLanguageMismatch: {
                errorMessage("Speech recognition error: grammarLanguageMismatch");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.microphoneUnavailable: {
                errorMessage("Speech recognition error: microphoneUnavailable");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.networkFailure: {
                errorMessage("Speech recognition error: networkFailure");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.pauseLimitExceeded: {
                errorMessage("Speech recognition error: pauseLimitExceeded");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.timeoutExceeded: {
                errorMessage("Speech recognition error: timeoutExceeded");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.topicLanguageNotSupported: {
                errorMessage("Speech recognition error: topicLanguageNotSupported");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.unknown: {
                errorMessage("Speech recognition error: unknown");
                break;
            }
            case Windows.Media.SpeechRecognition.SpeechRecognitionResultStatus.userCanceled: {
                errorMessage("Recognition canceled by the user.");
                break;
            }
            default: {
                break;
            }
        }
    }

    /// IMPORTANT CODE!
 
    function outputFunction(userOutput) {
        var listOfAppliances = ["light", "light.", "dimmer", "dimmer.", "heat", "heat.",
            "air conditioning", "air conditioning.", "fan", "fan.", "door", "door."];
        var listOfControls = ["open", "off", "up", "down", "unlock", "lock", "on", "close"];
        var listOfRooms = ["front", "back", "patio", "side", "bedroom", "bathroom", "kitchen",
            "upstairs", "downstairs"];
        var i;
        var j;
        var word = userOutput.split(" ");
        //document.getElementById("applianceID").innerText = "Not found";
        var x;
        var webpage = "http://10.8.0.60:8080/PSAPWebApp/smarthome/";
       
        /*
        for (i = 0; i < listOfAppliances.length; i++) {
            //Goes through each element of the word array (the sentence you speak into the microphone).
            for (j = 0; j < word.length; j++) {
                //Compares each word in the listOfAppliances array to every word in the word array.
                if (word[i] == listOfAppliances[j]) {
                    document.getElementById("applianceID").innerText += word[j];

                }
                else {
                    document.getElementById("applianceID").innerText += "Not found";
                }
                document.getElementById("applianceID").innerText += word[j] + " " + listOfAppliances[i];
            }
        }
        */

        // Lists of appliances, controls, and rooms
        for (x = 0; x < listOfAppliances.length; x++) {
            var n = userOutput.indexOf(listOfAppliances[x]);
            if (n != -1) {
                var appliance = listOfAppliances[x];
                document.getElementById("applianceID").innerText += appliance + " " + "\n";
                break;
            }
        }

        for (i = 0; i < listOfControls.length; i++) {
            var n = userOutput.indexOf(listOfControls[i]);
            if (n != -1) {
                var control = listOfControls[i];
                document.getElementById("controlID").innerText += control + " " + "\n";
                break;
            }
        }

        for (j = 0; j < listOfRooms.length; j++) {
            var n = userOutput.indexOf(listOfRooms[j]);
            if (n != -1) {
                var room = listOfRooms[j];
                document.getElementById("roomID").innerText += room + " " + "\n";
                break;
            }
            else {
                document.getElementById("roomID").innerText = "No room stated.";
            }
        }

        //Appliances
        if (appliance == "light") {
            webpage += "switchedlight/morganAvatar/";
            if (room != null) {
                webpage += room + "/";
            }
            if (control != null) {
                webpage += control + "/";
            }
        }
        
        if (appliance == "dimmer") {
            webpage += "dimmedlight/morganAvatar/";
            if (room != null) {
                webpage += room + "/";
            }
            if (control != null) {
                webpage += control + "/";
            }
        } 

       document.getElementById("webpageID").innerText = webpage;
    
       var uri = new Windows.Foundation.Uri(webpage);

        //Opens the url on external browser
        Windows.System.Launcher.launchUriAsync(uri).done(
            function (success) {
                if (success) { console.log("page opened correctly"); }
                else { console.log("an error has occured"); }
            });
        }

}());
