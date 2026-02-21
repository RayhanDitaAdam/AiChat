import type { Request, Response } from "express";
import * as contributorService from "./contributor.service.js";

export const createRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const request = await contributorService.createContributorRequest(userId, req.body);
        res.status(201).json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingRequests = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId; // Assuming ownerId is attached to req.user for owners
        if (!ownerId) return res.status(401).json({ message: "Unauthorized: No Request Details" });

        const requests = await contributorService.getContributorRequests(ownerId);
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId;
        const { requestId } = req.params;

        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const request = await contributorService.updateContributorRequestStatus(ownerId, requestId as string, req.body);
        res.json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listContributors = async (req: Request, res: Response) => {
    try {
        const ownerId = req.user?.ownerId;
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const contributors = await contributorService.getContributors(ownerId);
        res.json(contributors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const getMyRequests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const requests = await contributorService.getContributorRequestsByUser(userId);
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { requestId } = req.params;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await contributorService.deleteContributorRequest(userId, requestId as string);
        res.json({ message: "Request cancelled" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
