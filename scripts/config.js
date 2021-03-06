// This script creates a config.json file in the root folder.
// It overwrites the current config.js file.
// Execute this only once, before you start a instance/cluster of the server.

const fs = require('fs');
const path = require('path');
const alphabet = "4fPwKEjkGrBJst2MpFVZx9y5lIm6A7LDinQzgOhqaWC3obXuv0H1cNde8Y";

function randomString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result;
}

let config = {
    secret: randomString(24),
    encryptionKey: randomString(32),
    wsKey: randomString(24),
    adresses: {
        emailServer: "http://localhost:8787",
        staticServer: "http://localhost:8989",
        fileServer: "http://localhost:8888",
        apiServer: "http://localhost:8080",
        streamingServer: "http://localhost:8686",
        webSocketServer: "http://localhost:8585"
    },
    superAdmin: {
        _id: null,
        name: 'superAdmin',
        access: 'super',
        password: randomString(24),
        sessionTokens: []
    },
    email: {
        adress: '',
        password: '',
        server: '',
        port: ''
    }
};

console.log('please enter the email address for the app to use: ');

fs.writeFileSync(path.join(__dirname, '../', '/config.json'), JSON.stringify(config));