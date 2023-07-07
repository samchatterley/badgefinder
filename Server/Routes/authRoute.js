const express = require("express");
const router = express.Router();
const { UserService } = require("../models/UserService");
const UserClass = require("../models/UserClass")
const asyncHandler = require("express-async-handler");
const {
    body,
    validationResult
} = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
    logger
} = require('../../logger');

const userService = new UserService(new UserClass());

module.exports = () => {

    router.post("/signup", asyncHandler(async (req, res) => {
        logger.info("Signup request received");
        logger.info(req.body);

        if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.membershipNumber) {
            logger.info("Signup request missing necessary fields");
            return res.status(400).json({
                message: "Missing necessary fields"
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.info("Signup request validation errors", errors.array());
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const existingUser = await userService.findOne({
            email: req.body.email
        });
        if (existingUser) {
            logger.info("User with this email already exists");
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        const newUser = await userService.registerUser(req.body);
        if (!newUser) {
            logger.info("An error occurred while creating the user");
            return res.status(500).json({
                message: "An error occurred while creating the user"
            });
        }
        logger.info("User created successfully");
        return res.status(200).json({
            message: "User created successfully. Proceed to the second step",
            user: newUser
        });
    }));

    router.post("/signup-secondary", asyncHandler(async (req, res) => {
        logger.info("Signup-secondary request received");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.info("Signup-secondary request validation errors", errors.array());
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const user = await userService.findById(req.body._id);
        if (!user) {
            logger.info("User with this id does not exist");
            return res.status(404).json({
                message: "User with this id does not exist"
            });
        }

        if (user.username) {
            logger.info("User already completed the signup process");
            return res.status(409).json({
                message: "User already completed the signup process"
            });
        }

        const earnedBadges = req.body.earnedBadges || [];
        const requiredBadges = req.body.requiredBadges || [];

        const badgesCollection = req.client.db("yourDatabaseName").collection("Badges");

        user.earned_badges = await badgesCollection.find({
            badge_id: {
                $in: earnedBadges
            }
        }).toArray();
        user.required_badges = await badgesCollection.find({
            badge_id: {
                $in: requiredBadges
            }
        }).toArray();

        const updatedUser = await userService.registerSecondaryUser({
            _id: user._id,
            username: req.body.username,
            password: req.body.password,
            earned_badges: user.earned_badges,
            required_badges: user.required_badges
        });

        const token = jwt.sign({
                userId: updatedUser._id,
                email: updatedUser.email,
            },
            process.env.JWT_SECRET, {
                expiresIn: "1h"
            }
        );

        logger.info("Signup-secondary completed successfully");
        res.status(200).json({
            token,
            user: updatedUser
        });
    }));

    router.post(
        "/signin",
        [
            body("username").notEmpty().withMessage("Username is required"),
            body("password").notEmpty().withMessage("Password is required"),
        ],
        asyncHandler(async (req, res) => {
            logger.info("Signin request received");
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.info("Signin request validation errors", errors.array());
                return res.status(400).json({
                    errors: errors.array()
                });
            }

            const user = await userService.findOne({
                username: req.body.username
            });
            if (!user) {
                logger.info("Invalid username or password");
                return res.status(404).json({
                    error: "Invalid username or password"
                });
            }

            logger.info("Found user:", user);

            const match = await bcrypt.compare(req.body.password, user.password);
            if (!match) {
                logger.info("Invalid username or password");
                return res.status(400).json({
                    error: "Invalid username or password"
                });
            }

            logger.info("About to update user's last login time");
            const updatedUserResult = await userService.findOneAndUpdate({
                username: req.body.username
            }, {
                lastLogin: new Date()
            }, {
                returnOriginal: false
            });

            logger.info("findOneAndUpdate result:", updatedUserResult);

            if (!updatedUserResult) {
                logger.info("Failed to update user's last login time");
                return res.status(500).json({
                    error: "Failed to update user's last login time"
                });
            }

            const updatedUser = updatedUserResult;

            logger.info("Updated user:", updatedUser);

            logger.info("About to sign JWT");

            const token = jwt.sign({
                    userId: updatedUser.value._id.toString(),
                    email: updatedUser.value.email,
                    firstName: updatedUser.value.firstName,
                    lastName: updatedUser.value.lastName,
                },
                process.env.JWT_SECRET, {
                    expiresIn: "1h"
                }
            );

            logger.info("Signed JWT:", token);
            logger.info("Signin completed successfully");
            res.status(200).json({
                token,
                user: updatedUser.value
            });

        })
    );

    router.get(
        "/user/:userId",
        asyncHandler(async (req, res) => {
            logger.info("Get user request received");
            const user = await userService.findById(req.params.userId);

            if (!user) {
                logger.info("User not found");
                return res.status(404).json({
                    message: "User not found"
                });
            }

            logger.info("User found successfully");
            res.status(200).json(user);
        })
    );

    return router;
};