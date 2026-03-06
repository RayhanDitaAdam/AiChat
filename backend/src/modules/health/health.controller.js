 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import * as healthService from './health.service.js';

export const saveMedicalRecord = async (req, res) => {
    try {
        const { memberId, content } = req.body;
        const filePath = _optionalChain([req, 'access', _ => _.file, 'optionalAccess', _2 => _2.path]);

        let data;
        if (filePath) {
            data = await healthService.processMedicalRecord(memberId, filePath);
        } else {
            data = await healthService.saveMedicalRecord(memberId, content);
        }

        res.status(201).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const analyzeFood = async (req, res) => {
    try {
        const { memberId, text } = req.body;
        const filePath = _optionalChain([req, 'access', _3 => _3.file, 'optionalAccess', _4 => _4.path]);

        const data = await healthService.analyzeFood(memberId, filePath, text);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getHealthHistory = async (req, res) => {
    try {
        const { memberId } = req.params;
        const data = await healthService.getHealthHistory(memberId );
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
