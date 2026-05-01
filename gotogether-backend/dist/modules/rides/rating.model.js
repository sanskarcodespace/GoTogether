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
const ratingSchema = new mongoose_1.Schema({
    ride: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Ride', required: true },
    request: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RideRequest' },
    rater: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    rated: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    raterRole: { type: String, enum: ['provider', 'seeker'], required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
    tags: [
        {
            type: String,
            enum: ['punctual', 'safe_driving', 'friendly', 'clean_vehicle', 'on_time'],
        },
    ],
}, { timestamps: { createdAt: true, updatedAt: false } });
// One rating per direction per ride
ratingSchema.index({ ride: 1, rater: 1, rated: 1 }, { unique: true });
ratingSchema.index({ rated: 1, raterRole: 1 });
const Rating = mongoose_1.default.model('Rating', ratingSchema);
exports.default = Rating;
