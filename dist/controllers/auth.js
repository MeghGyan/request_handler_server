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
exports.me = exports.refresh = exports.login = exports.signup = void 0;
const __1 = require("..");
const bcrypt_1 = require("bcrypt");
const bad_request_1 = require("../exceptions/bad_request");
const root_1 = require("../exceptions/root");
const validation_1 = require("../exceptions/validation");
const user_1 = require("../schemas/user");
const auth_1 = require("../services/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret_1 = require("../secret");
const not_found_1 = require("../exceptions/not-found");
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    user_1.SignupSchema.parse(req.body);
    const { email, password, username } = req.body;
    let user = yield __1.prismaClient.user.findFirst({
        where: {
            email,
        },
    });
    if (user) {
        throw new bad_request_1.BadRequestException("User already exists", root_1.ErrorCode.USER_ALREADY_EXISTS);
    }
    user = yield __1.prismaClient.user.create({
        data: {
            email,
            password: (0, bcrypt_1.hashSync)(password, 10),
            username,
        },
    });
    const access_token = (0, auth_1.generateAccessToken)(user.id);
    const refresh_token = yield (0, auth_1.generateHashRefreshToken)(user.id);
    res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        access_token,
        refresh_token,
    });
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    user_1.LoginSchema.parse(req.body);
    const { email, password } = req.body;
    let user = yield __1.prismaClient.user.findUnique({ where: { email } });
    if (!user) {
        throw new not_found_1.NotFoundException("User not found", root_1.ErrorCode.USER_NOT_FOUND);
    }
    if (!(0, bcrypt_1.compareSync)(password, user.password)) {
        throw new bad_request_1.BadRequestException("Incorrect Credentials", root_1.ErrorCode.INCORRECT_CREDENTIALS);
    }
    const access_token = (0, auth_1.generateAccessToken)(user.id);
    const refresh_token = yield (0, auth_1.generateHashRefreshToken)(user.id);
    res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        access_token,
        refresh_token,
    });
});
exports.login = login;
const refresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('refresh');
    const { refresh_token } = req.body;
    if (!refresh_token)
        return res.status(401).json({ message: "Missing token" });
    try {
        const decoded = jsonwebtoken_1.default.verify(refresh_token, secret_1.JWT_REFRESH_SECRET);
        const storedTokenEntry = yield __1.prismaClient.refreshToken.findUnique({
            where: { tokenHash: refresh_token },
        });
        if (!storedTokenEntry) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        if (storedTokenEntry.expiresAt < new Date()) {
            yield __1.prismaClient.refreshToken.delete({
                where: { tokenHash: refresh_token },
            });
            return res.status(403).json({ message: "Refresh token expired" });
        }
        const access_token = (0, auth_1.generateAccessToken)(decoded.userId);
        const new_refresh_token = yield (0, auth_1.generateHashRefreshToken)(decoded.userId);
        yield __1.prismaClient.refreshToken.delete({
            where: { tokenHash: refresh_token },
        });
        return res.json({
            access_token,
            refresh_token: new_refresh_token,
        });
    }
    catch (err) {
        next(new validation_1.UnprocessableEntity((err === null || err === void 0 ? void 0 : err.issues) || err, "Could not generate tokens", root_1.ErrorCode.TOKEN_ERROR));
    }
});
exports.refresh = refresh;
function toSafeUser(user) {
    return Object.assign(Object.assign({}, user), { password: null });
}
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const safeUser = (0, auth_1.getSafeUser)(req.user);
    res.json(safeUser);
});
exports.me = me;
