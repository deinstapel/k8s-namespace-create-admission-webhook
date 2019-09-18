const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();

const options = {
    cert: fs.readFileSync(process.env.CERT_CRT),
    key: fs.readFileSync(process.env.CERT_KEY),
};


const answerCall = (res, isAllowed, explanation) => {
    console.log(`Answering Request with ${isAllowed}`);
    res.json({
        response: {
            allowed: isAllowed,
            result: {
                message: explanation,
            },
        },
    });
};

app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log('Path', req.path);
    console.log('Method', req.method);
    console.log('Body', JSON.stringify(req.body, null, '  '));

    next();
});

// Kubernetes Readyness Probe
app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.post('/', (req, res) => {
    const admissionRequest = req.body.request;

    const userNameParts = admissionRequest.userInfo.username.split(':');
    const userName = userNameParts[userNameParts.length - 1];

    if (!userName.startsWith('k8s-user-')) {
        return answerCall(res, true);
    }

    const user = userName.substr(9);
    const namespaceName = admissionRequest.object.metadata.name;

    const isAllowed = namespaceName.startsWith(`${user}-`);
    console.log('user', user);
    console.log('namespace', namespaceName);
    console.log('isAllowed', isAllowed);

    const denyExplanation = !isAllowed ? 'You are not allowed to use namespaces, which are not prefixed with your username.' : '';

    return answerCall(res, isAllowed, denyExplanation);
});

https.createServer(options, app).listen(6443, () => {
    console.log('Created Server on 6443');
});
