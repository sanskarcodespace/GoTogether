"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.logger = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const winston_1 = __importDefault(require("winston"));
const socket_1 = require("./utils/socket");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Logger configuration
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
exports.io = (0, socket_1.initSocket)(server);
// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gotogether';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    exports.logger.info('Connected to MongoDB');
    server.listen(PORT, () => {
        exports.logger.info(`Server is running on port ${PORT}`);
    });
})
    .catch((err) => {
    exports.logger.error('MongoDB connection error:', err);
    process.exit(1);
});
// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    exports.logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    exports.logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', (err) => {
    exports.logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    exports.logger.error(err.name, err.message);
    process.exit(1);
});
