const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const { logAudit } = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', requirePermission('leaves:read'), leaveController.getLeaves);
router.post('/', requirePermission('leaves:apply'), logAudit('CREATE', 'LEAVES'), leaveController.applyLeave);
router.patch('/:id/status', requirePermission('leaves:approve'), logAudit('UPDATE', 'LEAVES'), leaveController.updateLeaveStatus);

module.exports = router;
