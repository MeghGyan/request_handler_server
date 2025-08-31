"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const prisma_1 = require("../generated/prisma");
const secret_1 = require("./secret");
const errors_1 = require("./middlewares/errors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = secret_1.PORT;
exports.prismaClient = new prisma_1.PrismaClient({
    log: ['query'],
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("This is user server!");
});
app.use('/api', routes_1.rootRouter);
app.use(errors_1.errorMiddleware);
app.listen(port, () => {
    console.log(`User server is running on port ${port}`);
});
