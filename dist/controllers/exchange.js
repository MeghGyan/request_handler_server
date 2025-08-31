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
exports.getExchanges = exports.createExchange = void 0;
const __1 = require("..");
const pageSize = 15;
const createExchange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_query, convId } = req.body;
    let { convTitle } = req.body;
    let newConversation = null;
    let conversationId = convId;
    if (!convTitle) {
        convTitle = "A new Title";
    }
    if (!conversationId) {
        newConversation = yield __1.prismaClient.conversation.create({
            data: {
                userId: req.user.id,
                title: convTitle,
            },
        });
        conversationId = newConversation.id;
    }
    yield __1.prismaClient.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });
    const systemResponse = "I am a helpful assistant.";
    const exchange = yield __1.prismaClient.exchange.create({
        data: {
            userQuery: user_query,
            conversationId,
            systemResponse,
        },
    });
    return res.status(200).json({
        exchange,
        conversation: newConversation,
    });
});
exports.createExchange = createExchange;
const getExchanges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, page } = req.body;
    const exchanges = yield __1.prismaClient.exchange.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    res.json({
        exchanges,
    });
});
exports.getExchanges = getExchanges;
