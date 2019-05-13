const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const answerCall = (isAllowed, res) => {
    res.json({
        allowed: isAllowed,
    });
};

app.use(bodyParser.json());

app.use('/validateNamespaceCreation', (req, res) => {
    if (req.body.operation !== 'CREATE') {
        return answerCall(true, res);
    }

    console.log(JSON.stringify(req.body, null, '  '));

    const user = req.body.userInfo.Username.substr(10);
    const createdNamespaceName = req.body.metadata.name;

    const isAllowed = createdNamespaceName.startsWith(`${user}-`);
    console.log('user', user);
    console.log('namespace', createdNamespaceName);
    console.log('isAllowed', isAllowed);

    return answerCall(isAllowed, res);
});

app.listen(3000);
console.log('Listening on port 3000');
