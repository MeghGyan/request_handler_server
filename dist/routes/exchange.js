"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_handler_1 = require("../error-handler");
const auth_1 = __importDefault(require("../middlewares/auth"));
const exchange_1 = require("../controllers/exchange");
const exchRoutes = (0, express_1.Router)();
exchRoutes.get('/getexch', [auth_1.default], (0, error_handler_1.errorHandler)(exchange_1.getExchanges));
exchRoutes.post('/createexch', [auth_1.default], (0, error_handler_1.errorHandler)(exchange_1.createExchange));
exports.default = exchRoutes;
