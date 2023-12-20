const OpenAI = require('openai');
const fs = require('fs');
const {post} = require("axios");
const FormData = require('form-data');
const i18nPT = require('../i18n/pt_BR');
const i18nEN = require('../i18n/en_US');
const {translate} = require("../utils");

class OpenAIService {

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
}

module.exports = {
    OpenAIService
}