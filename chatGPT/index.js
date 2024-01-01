const OpenAI = require('openai');
const {post} = require("axios");
const FormData = require('form-data');
const {translate} = require("../utils");

module.exports = class OpenAIService {

    #openAi = null;
    model = "gpt-3.5-turbo"
    transcriptModel = "whisper-1"

    constructor() {
        if (!this.#openAi) {
            this.#openAi = new OpenAI();
        }
    }

    async transcriptCallWithFetch(audioFileBuffer) {
        const formData = new FormData();
        formData.append('model', this.transcriptModel);
        formData.append('file', audioFileBuffer, {
            filename: 'call.mp3',
            contentType: 'audio/mp3',
        });
        const response = await post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        if (response?.status === 200 && response?.data?.text) {
            return response.data.text;
        } else {
            throw Error('Error on transcript call')
        }
    }

    async checkSentimentOfCallTranscription(callTranscription) {
        let resp = await this.#openAi.chat.completions.create({
            model: this.model,
            messages: [
                {role: "user", content: `Análise de sentimento do seguinte texto (transcrito de uma chamada telefônica): ${callTranscription}`}
            ]
        })

        if (resp.choices?.length) {
            return resp.choices[0].message;
        }
    }

    async checkPredictionOfSaleFromCallTranscription(callTranscription) {
        let resp = await this.#openAi.chat.completions.create({
            model: this.model,
            messages: [
                {role: "user", content: `O texto a seguir é uma transcrição de uma ligação entre um vendedor e um cliente. Analisando a mesma, qual a probabilidade, de 0 a 100, da venda ser realizada? Chamada transcrita: ${callTranscription}`}
            ]
        })

        if (resp.choices?.length) {
            return resp.choices[0].message;
        }
    }

    async checkSentimentOfText(textToAnalyze, lang = 'en_US') {
        let promptText = translate('sentimentAnalysisPrompt', lang);

        promptText += `: ${textToAnalyze}`;

        let resp = await this.#openAi.chat.completions.create({
            model: this.model,
            messages: [
                {role: "user", content: promptText}
            ]
        })

        if (resp.choices?.length) {
            return resp.choices[0].message?.content;
        }
    }

    async generateWonSaleText() {
        let resp = await this.#openAi.chat.completions.create({
            model: this.model,
            messages: [
                {role: "system", content: "You are a salesman"},
                {role: "user", content: "Write a generic welcome email to a new customer, using, at maximum, 100 words"},
                {role: "assistant", content: "The name of the customer must be replaced with the variable {{name}}"},
                {role: "assistant", content: "The name of the company must be replaced with the variable {{company}}"},
                {role: "assistant", content: "The name of the salesman must be replaced with the variable {{salesman}}"},
            ]
        })

        if (resp.choices?.length) {
            return resp.choices[0].message?.content;
        }
    }
}