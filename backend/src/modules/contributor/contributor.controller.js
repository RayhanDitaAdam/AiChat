 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import * as contributorService from "./contributor.service.js";

export const createRequest = async (req, res) => {
    try {
        const userId = _optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.id]);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const request = await contributorService.createContributorRequest(userId, req.body);
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.ownerId]); // Assuming ownerId is attached to req.user for owners
        if (!ownerId) return res.status(401).json({ message: "Unauthorized: No Request Details" });

        const requests = await contributorService.getContributorRequests(ownerId);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.ownerId]);
        const { requestId } = req.params;

        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const request = await contributorService.updateContributorRequestStatus(ownerId, requestId , req.body);
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const listContributors = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _7 => _7.user, 'optionalAccess', _8 => _8.ownerId]);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const contributors = await contributorService.getContributors(ownerId);
        res.json(contributors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getMyRequests = async (req, res) => {
    try {
        const userId = _optionalChain([req, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.id]);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const requests = await contributorService.getContributorRequestsByUser(userId);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const userId = _optionalChain([req, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id]);
        const { requestId } = req.params;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await contributorService.deleteContributorRequest(userId, requestId );
        res.json({ message: "Request cancelled" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkRemoveContributors = async (req, res) => {
    try {
        const ownerId = _optionalChain([req, 'access', _13 => _13.user, 'optionalAccess', _14 => _14.ownerId]);
        const { userIds } = req.body;

        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });
        if (!Array.isArray(userIds)) return res.status(400).json({ message: "userIds must be an array" });

        const result = await contributorService.bulkRemoveContributors(ownerId, userIds);
        res.json({
            status: 'success',
            message: `${result.count} contributors removed successfully`,
            count: result.count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
