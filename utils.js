const i18nEN = require('./i18n/en_US.json');
const i18nPT = require('./i18n/pt_BR.json');

const translate = (key, language = 'en_US') => {
    switch (language) {
        case 'en_US':
            return i18nEN[key];
        case 'pt_BR':
            return i18nPT[key];
    }
}

module.exports = {
    translate
}