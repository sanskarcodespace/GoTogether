"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const response_1 = require("./utils/response");
// Import Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const ride_routes_1 = __importDefault(require("./modules/rides/ride.routes"));
const rating_routes_1 = __importDefault(require("./modules/rides/rating.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const sos_routes_1 = __importDefault(require("./modules/admin/sos.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, hpp_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});
app.use('/api', limiter);
// Standard Middlewares
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use((0, morgan_1.default)('dev'));
// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/rides', ride_routes_1.default);
app.use('/api/v1/ratings', rating_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
app.use('/api/v1/sos', sos_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
// 404 Handler
app.all('*', (req, res, next) => {
    next(new response_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use(errorHandler_1.default);
exports.default = app;
