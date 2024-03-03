let questions = [];


function addQuestion() {
    const question = document.getElementById('question').value;

    if (question) {
        const options = [
            document.getElementById('option1').value,
            document.getElementById('option2').value,
            document.getElementById('option3').value,
            document.getElementById('option4').value
        ];
        questions.push({ question, options });
        renderQuestions();
    } else {

    }
}

function renderQuestions() {

    //To erase the filled values of Questions and Answer . 
    const form_value = document.getElementsByClassName('form_value');

    for (let i = 0; i < 5; i++)  form_value[i].value = "";

    const questionsDiv = document.getElementById("questions");
    questionsDiv.innerHTML = "";
    questions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.innerHTML = `<b>Question ${index + 1}:</b> ${q.question}`;
        questionsDiv.appendChild(questionDiv);
    });
}

async function submitQuestionnaire() {
    const questionnaireTitle = document.getElementById("questionnaire-title").value;
    if (!questionnaireTitle || questions.length === 0) {
        document.getElementById("response").innerHTML = "Please enter questionnaire title and add questions.";
        return;
    }

    const response = await fetch('http://localhost:3000/questionnaire', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: questionnaireTitle,
            questions
        })
    });

    // NOw working fine as it is no frontend we have to give full url . *
    if (response.ok) {
        fetch('http://localhost:3000/questionnaires')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Process the response data from the backend API
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        document.getElementById("response").innerHTML = "Questionnaire submitted successfully.";


    } else {
        document.getElementById("response").innerHTML = "Failed to submit questionnaire.";
    }
}

