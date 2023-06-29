const express = require('express');
const userRoute = require('../Routes/userRoute'); 
const User = require('../models/users');

function createTestServer() {
    const app = express();
    app.use(express.json());

    // Mount the userRoute on the test server
    app.use('/user', userRoute(User));

    return app;
}

module.exports = createTestServer;