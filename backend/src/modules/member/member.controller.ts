import type { Request, Response } from 'express';
import * as memberService from './member.service.js';

export const getMembers = async (req: Request, res: Response) => {
    try {
        const search = req.query['search'] as string | undefined;
        const data = await memberService.getMembers(search);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getMemberDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await memberService.getMemberDetail(id as string);
        if (!data) return res.status(404).json({ status: 'error', message: 'Member not found' });
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
