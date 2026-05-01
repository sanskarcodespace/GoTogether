"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../utils/response");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const notification_service_1 = require("./notification.service");
const notification_model_1 = __importDefault(require("./notification.model"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
// ─── List notifications (paginated, lean, compound-index hit) ─────────────────
router.get('/', (0, response_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const unreadOnly = req.query.unreadOnly === 'true';
    if (unreadOnly) {
        // Cheaper path: only unread, uses compound index { user, isRead }
        const [notifications, unreadCount] = await Promise.all([
            notification_model_1.default.find({ user: req.user.id, isRead: false })
                .select('type title body isRead createdAt data')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            notification_model_1.default.countDocuments({ user: req.user.id, isRead: false }),
        ]);
        return (0, response_1.formatResponse)(res, 200, 'Notifications fetched', notifications, {
            page, limit, total: unreadCount, unreadCount,
        });
    }
    const result = await (0, notification_service_1.getUserNotifications)(req.user.id, page, limit);
    return (0, response_1.formatResponse)(res, 200, 'Notifications fetched', result.notifications, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        unreadCount: result.unreadCount,
    });
}));
// ─── Mark all read (single indexed update) ────────────────────────────────────
router.put('/read-all', (0, response_1.asyncHandler)(async (req, res) => {
    await (0, notification_service_1.markAllRead)(req.user.id);
    return (0, response_1.formatResponse)(res, 200, 'All marked as read');
}));
// ─── Mark single notification read ───────────────────────────────────────────
router.put('/:notificationId/read', (0, response_1.asyncHandler)(async (req, res) => {
    await notification_model_1.default.findOneAndUpdate({ _id: req.params.notificationId, user: req.user.id }, { $set: { isRead: true } });
    return (0, response_1.formatResponse)(res, 200, 'Marked as read');
}));
exports.default = router;
