import { Router } from "express";
import authRoutes from "./auth";
import convRoutes from "./conversation";
import exchRoutes from "./exchange";
export const rootRouter:Router=Router();

rootRouter.use('/auth/v1',authRoutes)
rootRouter.use('/conv/v1',convRoutes)
rootRouter.use('/exch/v1',exchRoutes)