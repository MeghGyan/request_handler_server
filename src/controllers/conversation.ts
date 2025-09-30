import { Request, Response } from 'express';
import { prismaClient } from '..';


const pageSize: number = 15

export const getRecentConversations =async(req: Request, res:Response)=>{
    const {page}=req.body;
    const userId=req.user.id;

    const conversations = await prismaClient.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    });
    res.json(
    {conversations,
    page,
    }
    );
}
