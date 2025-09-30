"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSafeUser = exports.generateHashRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("../");
const secret_1 = require("../secret");
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId: userId }, secret_1.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateHashRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const refresh_token = jsonwebtoken_1.default.sign({ userId: userId }, secret_1.JWT_REFRESH_SECRET, {
        expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    yield __1.prismaClient.refreshToken.create({
        data: {
            userId: userId,
            tokenHash: refresh_token,
            expiresAt
        },
    });
    return refresh_token;
});
exports.generateHashRefreshToken = generateHashRefreshToken;
const getSafeUser = (user) => {
    return Object.assign(Object.assign({}, user), { password: null });
};
exports.getSafeUser = getSafeUser;
