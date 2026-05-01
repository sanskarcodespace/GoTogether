"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.getUserNotifications = exports.sendPushNotification = void 0;
const notification_model_1 = __importDefault(require("./notification.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const server_1 = require("../../server");
const firebase_1 = require("../../config/firebase");
const sendPushNotification = async (userId, payload) => {
    try {
        // Only select fcmToken — avoid fetching entire user document
        const user = await user_model_1.default.findById(userId).select('fcmToken').lean();
        if (!user || !user.fcmToken) {
            server_1.logger.info(`Notification skipped: User ${userId} has no FCM token`);
            return;
        }
        // Parallel: save notification record + send FCM concurrently
        await Promise.all([
            notification_model_1.default.create({
                user: userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                data: payload.data,
            }),
            firebase_1.fcm.send({
                notification: { title: payload.title, body: payload.body },
                data: { ...payload.data, type: payload.type },
                token: user.fcmToken,
            }),
        ]);
        server_1.logger.info(`Notification sent to user ${userId}`);
    }
    catch (error) {
        // Non-fatal — notification failure should not crash the request
        server_1.logger.error('Push notification error:', error);
    }
};
exports.sendPushNotification = sendPushNotification;
/**
 * Fetch paginated notifications for a user (lean, compound index hit).
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * Math.min(limit, 50);
    const cap = Math.min(limit, 50);
    const [notifications, total, unreadCount] = await Promise.all([
        notification_model_1.default.find({ user: userId })
            .select('type title body isRead createdAt data')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(cap)
            .lean(),
        notification_model_1.default.countDocuments({ user: userId }),
        notification_model_1.default.countDocuments({ user: userId, isRead: false }),
    ]);
    return { notifications, total, unreadCount, page, limit: cap };
};
exports.getUserNotifications = getUserNotifications;
/**
 * Mark all unread notifications as read (single update, indexed).
 */
const markAllRead = async (userId) => {
    await notification_model_1.default.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
};
exports.markAllRead = markAllRead;
