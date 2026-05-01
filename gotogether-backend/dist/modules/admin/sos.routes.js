"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../utils/response");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const sos_model_1 = __importDefault(require("../admin/sos.model"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/', (0, response_1.asyncHandler)(async (req, res) => {
    const { rideId, requestId, location } = req.body;
    const sosEvent = await sos_model_1.default.create({
        user: req.user.id,
        ride: rideId,
        request: requestId,
        location,
        status: 'active',
    });
    // TODO: Trigger push notifications to emergency contacts & Admin socket alerts
    return (0, response_1.formatResponse)(res, 201, 'SOS triggered', sosEvent);
}));
exports.default = router;
