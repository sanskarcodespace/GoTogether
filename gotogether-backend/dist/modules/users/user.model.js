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
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    phone: { type: String, unique: true, required: true, index: true, trim: true },
    email: { type: String, sparse: true, trim: true, lowercase: true },
    password: { type: String, select: false },
    name: { type: String, trim: true },
    profilePhoto: { type: String },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    vehicle: {
        type: { type: String, enum: ['bike', 'car'] },
        model: String,
        color: String,
        plateNumber: String,
        isVerified: { type: Boolean, default: false },
    },
    rating: {
        asProvider: {
            average: { type: Number, default: 5.0 },
            count: { type: Number, default: 0 },
        },
        asSeeker: {
            average: { type: Number, default: 5.0 },
            count: { type: Number, default: 0 },
        },
    },
    stats: {
        totalRidesAsProvider: { type: Number, default: 0 },
        totalRidesAsSeeker: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
    },
    emergencyContact: {
        name: String,
        phone: String,
    },
    fcmToken: { type: String },
    refreshTokens: [String],
    lastActive: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
// Indexes
userSchema.index({ isActive: 1, isBanned: 1 });
userSchema.index({ createdAt: -1 });
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
