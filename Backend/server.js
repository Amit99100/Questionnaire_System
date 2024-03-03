const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const { all } = require('axios');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());


// Middleware added 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));



// Load questionnaire data from JSON file
const questionnaireData = JSON.parse(fs.readFileSync('questions.json'));

// Frontend\index2.html
// Middleware for parsing JSON only for specific routes
app.use('/questionnaire', bodyParser.json());

// Connect to MongoDB database
let MONGO_URL = "mongodb+srv://akm1632456:Amit456@cluster0.4zwu9ey.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Define questionnaire schema
const questionnaireSchema = new mongoose.Schema({
    title: String,
    questions: [
        {
            question: String,
            options: [String]
        }
    ]
});

//  mongoose model
const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);


// Route to display questionnaire form
app.get('/form', (req, res) => {


    res.sendFile(__dirname + '/index2.html');
});

// Define route to handle the redirection
app.get('/success', (req, res) => {
    // Send a response indicating success
    res.send('Job done successfully!');
});



// Define the schema for storing form filled Data 
const dataFormScheme = new mongoose.Schema({
    title: String,
    responses: [{
        index: {
            type: String,
            required: true
        },
        responses: [{
            type: String,
            required: true
        }]
    }],


});
const myDataModel = mongoose.model('myDataModel', dataFormScheme);




// Define a route to handle GET requests
app.get('/data', async (req, res) => {
    try {
        // Retrieve all documents from the collection
        const allDocuments = await myDataModel.find({});
        res.json(allDocuments[allDocuments.length - 1]); // Send the retrieved data as the response
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});




// Route to handle form submission
app.post('/submit', async (req, res) => {
    const formData = req.body;
    console.log(formData);

    myDataModel.insertMany(formData)
        .then((docs) => {
            console.log('Data stored successfully:', docs);

        })
        .catch((error) => {
            console.error('Error storing data:', error);
        });
    res.redirect('/data');
});

// Route to provide questionnaire data to the client
app.get('/questionform', async (req, res) => {
    res.json(questionnaireData);
});


// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes
// Create a questionnaire
app.post('/questionnaire', async (req, res) => {
    try {
        console.log("something happpened "); ///                                    added now .
        const newQuestionnaire = await Questionnaire.create(req.body);
        res.status(201).json(newQuestionnaire);

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }

});

app.get('/questionnaires', async (req, res) => {

    try {

        const questionnaires = await Questionnaire.find();

        let transformedData;
        questionnaires.forEach((element, index) => {

            transformedData = {
                title: questionnaires[index].title,
                questions: questionnaires[index].questions.map(question => ({
                    question: question.question,
                    options: question.options
                }))
            };
        })


        // console.log(transformedData);

        const jsonData = JSON.stringify(transformedData, null, 2);
        fs.writeFile('questions.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Data written to questions.json file successfully.');
            }
        });
        res.status(200).json(questionnaires);

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

