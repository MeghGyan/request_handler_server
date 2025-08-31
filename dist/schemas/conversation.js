"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentConversationSchema = void 0;
const zod_1 = require("zod");
exports.getRecentConversationSchema = zod_1.z.object({
    page: zod_1.z.number()
});
