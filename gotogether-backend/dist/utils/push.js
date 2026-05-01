"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const firebase_1 = require("../config/firebase");
const server_1 = require("../server");
const sendPushNotification = async (payload) => {
    try {
        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            token: payload.token,
        };
        const response = await firebase_1.fcm.send(message);
        server_1.logger.info(`Successfully sent push notification: ${response}`);
        return true;
    }
    catch (error) {
        server_1.logger.error('Error sending push notification:', error);
        return false;
    }
};
exports.sendPushNotification = sendPushNotification;
