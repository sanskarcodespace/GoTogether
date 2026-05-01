"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.fcm = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};
if (firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(firebaseConfig),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}
exports.db = firebase_admin_1.default.database();
exports.fcm = firebase_admin_1.default.messaging();
exports.auth = firebase_admin_1.default.auth();
exports.default = firebase_admin_1.default;
