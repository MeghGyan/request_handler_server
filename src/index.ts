import express, { Request, Response, Express } from 'express';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { rootRouter } from './routes';
import { PrismaClient } from '../generated/prisma';
import { PORT } from './secret';
import { errorMiddleware } from './middlewares/errors';
import { SignupSchema } from './schemas/user';


dotenv.config();
const app:Express = express();
const port = PORT
export const prismaClient = new PrismaClient({
    log: ['query'],
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("This is user server!");
});

app.use('/api', rootRouter)

app.use(errorMiddleware)
app.listen(port, () => {
  console.log(`User server is running on port ${port}`);
});
