"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("./auth.controller"));
const validateMiddleware_1 = require("../../middleware/validateMiddleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.post('/send-otp', (0, validateMiddleware_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number')
    })
})), authController.sendOTP);
router.post('/verify-otp', (0, validateMiddleware_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number'),
        otp: zod_1.z.string().length(6).regex(/^\d+$/, 'OTP must be 6 digits')
    })
})), authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/admin/login', (0, validateMiddleware_1.validate)(zod_1.z.object({ body: zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(6) }) })), authController.adminLogin);
exports.default = router;
