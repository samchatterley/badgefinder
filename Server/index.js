require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const morgan = require('morgan');
const winston = require('winston');
const csurf = require('csurf');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {
        service: 'user-service'
    },
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

const authRoutes = require('./Routes/authRoute');
const userRoutes = require('./Routes/userRoute');
const badgesRouter = require('./Routes/all_badges');
const requirementsRouter = require('./Routes/requirements_by_id');
const badgeByRequirementRouter = require('./Routes/badge_by_requirement');
const badgeByNameRouter = require('./Routes/badge_by_name');
const badgeByCategoryRouter = require('./Routes/badge_by_categories');
const { UserService } = require("./models/UserService");

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is not set");
}

app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production'
    }
}));
app.use(csurf());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });
let userService;

async function connectDB() {
    try {
        await client.connect();
        await client.db('admin').command({
            ping: 1
        });
        logger.info('Ping successful. Connected to BadgeFinder database.');
        userService = new UserService(client);
        app.use(async (req, res, next) => {
            req.client = client;
            req.userService = userService;
            next();
        });

        app.use('/auth', authRoutes(userService));
        app.use('/user', userRoutes(userService));
        app.use('/badges', badgesRouter);
        app.use('/requirements', requirementsRouter);
        app.use('/badges/requirements', badgeByRequirementRouter);
        app.use('/badges/search', badgeByNameRouter);
        app.use('/badges/category', badgeByCategoryRouter);

        app.use((err, req, res, next) => {
            logger.error(err.stack);
            res.status(500).send(process.env.NODE_ENV === 'production' ? 'Something broke!' : err.message);
        });

        app.listen(port, () => {
            logger.info(`Server is running on port: ${port}`);
        });

    } catch (err) {
        logger.error(err);
    }
}

(async () => {
    try {
        await connectDB();
    } catch (err) {
        logger.error(err);
    }
})();

process.on('SIGINT', async () => {
    try {
        await client.close();
        logger.info('MongoDB connection closed');
        process.exit(0);
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
});
