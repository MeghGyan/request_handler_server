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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentConversations = void 0;
const __1 = require("..");
const pageSize = 15;
const getRecentConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.body;
    const userId = req.user.id;
    const conversations = yield __1.prismaClient.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const totalCount = yield __1.prismaClient.conversation.count({
        where: { userId },
    });
    res.json({ conversations,
        pagination: {
            page,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }, });
});
exports.getRecentConversations = getRecentConversations;
