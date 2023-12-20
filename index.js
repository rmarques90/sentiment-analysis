const {configDotenv} = require("dotenv");
const {OpenAIService} = require("./chatGPT");
const fs = require("fs");
const express = require('express');

configDotenv();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const openAiService = new OpenAIService();

app.post('/transcript', (req, res) => {
    let file = req.body.file;

    return res.status(200).json({ok: true});
})

app.post('/sentiment', async (req, res) => {
    let text = req.body.text;
    let language = req.body.lang;
    if (!text) {
        return res.status(400).json({ok: false, message: 'text is required'});
    }

    let sentiment = await openAiService.checkSentimentOfText(text, language);

    return res.status(200).json({sentiment: sentiment});
});

app.listen(PORT, () => {
    console.log('server started on port: ' + PORT);
});
