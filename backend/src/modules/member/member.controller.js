
import * as memberService from './member.service.js';

export const getMembers = async (req, res) => {
    try {
        const search = req.query['search'] ;
        const data = await memberService.getMembers(search);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getMemberDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await memberService.getMemberDetail(id );
        if (!data) {
            res.status(404).json({ status: 'error', message: 'Member not found' });
            return;
        }
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const lookupMember = async (req, res) => {
    try {
        const identifier = req.query['identifier'] ;
        if (!identifier) return res.status(400).json({ status: 'error', message: 'Identifier is required' });

        const data = await memberService.identifyMember(identifier);
        if (!data) return res.status(404).json({ status: 'error', message: 'Member not found' });

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
