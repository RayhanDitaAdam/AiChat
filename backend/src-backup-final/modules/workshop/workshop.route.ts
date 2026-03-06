import { Router } from 'express';
import { workshopController } from './workshop.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();
const auth = authenticate;

// Work Orders
router.get('/work-orders', auth, (req, res) => workshopController.getWorkOrders(req, res));
router.post('/work-orders', auth, (req, res) => workshopController.createWorkOrder(req, res));
router.patch('/work-orders/:id', auth, (req, res) => workshopController.updateWorkOrder(req, res));
router.delete('/work-orders/:id', auth, (req, res) => workshopController.deleteWorkOrder(req, res));
router.post('/work-orders/:workOrderId/items', auth, (req, res) => workshopController.addItem(req, res));
router.delete('/items/:itemId', auth, (req, res) => workshopController.deleteItem(req, res));
router.get('/history/:plate', auth, (req, res) => workshopController.getVehicleHistory(req, res));

// Mechanics
router.get('/mechanics', auth, (req, res) => workshopController.getMechanics(req, res));
router.post('/mechanics', auth, (req, res) => workshopController.createMechanic(req, res));
router.patch('/mechanics/:id', auth, (req, res) => workshopController.updateMechanic(req, res));
router.delete('/mechanics/:id', auth, (req, res) => workshopController.deleteMechanic(req, res));

// Commission
router.get('/commission', auth, (req, res) => workshopController.getMechanicCommissions(req, res));

// Attendance
router.get('/attendance', auth, (req, res) => workshopController.getAttendances(req, res));
router.post('/attendance', auth, (req, res) => workshopController.createAttendance(req, res));
router.post('/mechanics/:mechanicId/clock-in', auth, (req, res) => workshopController.clockIn(req, res));
router.post('/mechanics/:mechanicId/clock-out', auth, (req, res) => workshopController.clockOut(req, res));
router.delete('/attendance/:id', auth, (req, res) => workshopController.deleteAttendance(req, res));

// Suppliers
router.get('/suppliers', auth, (req, res) => workshopController.getSuppliers(req, res));
router.post('/suppliers', auth, (req, res) => workshopController.createSupplier(req, res));
router.patch('/suppliers/:id', auth, (req, res) => workshopController.updateSupplier(req, res));
router.delete('/suppliers/:id', auth, (req, res) => workshopController.deleteSupplier(req, res));

export default router;
