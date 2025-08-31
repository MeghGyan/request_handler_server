"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRouter = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const conversation_1 = __importDefault(require("./conversation"));
const exchange_1 = __importDefault(require("./exchange"));
exports.rootRouter = (0, express_1.Router)();
exports.rootRouter.use('/auth/v1', auth_1.default);
exports.rootRouter.use('/conv/v1', conversation_1.default);
exports.rootRouter.use('/exch/v1', exchange_1.default);
