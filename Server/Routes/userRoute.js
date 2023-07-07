const express = require("express");
const asyncHandler = require("express-async-handler");
const { ObjectId } = require('mongodb');
const { logger } = require('../../logger');
const userMiddleware = require('../Middleware/userMiddleware');

module.exports = (userInstance) => {
    const router = express.Router();
    router.use(userMiddleware);

    router.get("/:id", asyncHandler(async (req, res, next) => {
        const userId = req.params.id;
        try {
            logger.info("Received GET request for user with id:", userId);
            const user = await userInstance.findById(new ObjectId(userId));
            if (!user) throw new UserNotFoundError(`No user found with id ${userId}`);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }));

    router.post("/:id/badge", asyncHandler(async (req, res, next) => {
        const userId = req.params.id;
        const badgeId = req.body.badgeId;
        try {
            logger.info("Received POST request for user with id:", userId);
            if (!badgeId) throw new InvalidBadgeIdError("BadgeId is required");
            const badge = await userInstance.badgesCollection.findOne({
                badge_id: new ObjectId(badgeId)
            });
            if (!badge) throw new BadgeNotFoundError("Badge not found");
            const updatedUser = await userInstance.addBadge(new ObjectId(userId), new ObjectId(badgeId));
            logger.info("User updated successfully");
            res.status(201).json(updatedUser);
        } catch (err) {
            next(err);
        }
    }));

    router.delete("/:id/badge/:badgeId", asyncHandler(async (req, res, next) => {
        const userId = req.params.id;
        const badgeId = req.params.badgeId;
        try {
            logger.info("Received DELETE request for user with id:", userId);
            const user = await userInstance.findById(new ObjectId(userId));
            if (!user || !user.earned_badges.find(badge => badge.badge_id === badgeId)) {
                throw new DoesNotHaveBadgeError("User does not have the badge");
            }
            const updatedUser = await userInstance.removeBadge(new ObjectId(userId), new ObjectId(badgeId));
            logger.info("User updated successfully");
            res.json(updatedUser);
        } catch (err) {
            next(err);
        }
    }));

    router.patch("/:id/badge/:badgeId/requirement/:requirementId", asyncHandler(async (req, res, next) => {
        const userId = req.params.id;
        const badgeId = req.params.badgeId;
        const requirementId = req.params.requirementId;
        const completed = req.body.completed;
        try {
            logger.info(`Received PATCH request for user with id ${userId}, badge id ${badgeId}, and requirement id ${requirementId}`);
            if (completed === undefined) throw new InvalidCompletionStatusError("Completed is required");
            const user = await userInstance.findById(new ObjectId(userId));
            if (!user) throw new UserNotFoundError("User not found");
            const badge = user.earned_badges.find(badge => badge.badge_id === badgeId);
            if (!badge) throw new BadgeNotFoundError(`Badge with id ${badgeId} not found`);
            if (!badge.requirements) throw new UserError("Badge does not have any requirements");
            const requirement = badge.requirements.find(requirement => requirement.requirement_id === requirementId);
            if (!requirement) throw new RequirementNotFoundError(`Requirement with id ${requirementId} not found`);
            const updateOperation = {
                $set: {
                    "earned_badges.$[badge].requirements.$[requirement].completed": completed
                }
            };
            const options = {
                arrayFilters: [{
                    "badge.badge_id": badgeId
                }, {
                    "requirement.requirement_id": requirementId
                }],
                new: true
            };
            const updatedUser = await userInstance.findOneAndUpdateWithOperations({
                _id: new ObjectId(userId)
            }, updateOperation, options);
            logger.info("User updated successfully");
            if (!updatedUser) throw new Error("Update failed");
            res.json(updatedUser.value);
        } catch (err) {
            next(err);
        }
    }));

    router.all('*', (req, res) => {
        res.status(405).json({
            message: 'Method not allowed'
        });
    });

    return router;
};
