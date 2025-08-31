"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_handler_1 = require("../error-handler");
const auth_1 = __importDefault(require("../middlewares/auth"));
const conversation_1 = require("../controllers/conversation");
const convRoutes = (0, express_1.Router)();
convRoutes.get('/getrecentconv', [auth_1.default], (0, error_handler_1.errorHandler)(conversation_1.getRecentConversations));
exports.default = convRoutes;
