const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const { logAudit } = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', requirePermission('attendance:read'), attendanceController.getAttendance);
router.post('/', requirePermission('attendance:mark'), logAudit('CREATE', 'ATTENDANCE'), attendanceController.markAttendance);

module.exports = router;
