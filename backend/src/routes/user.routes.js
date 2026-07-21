const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const { logAudit } = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', requirePermission('auditlogs:read'), userController.getUsers);
router.post('/', requirePermission('auditlogs:read'), logAudit('CREATE', 'USER'), userController.createUser);
router.patch('/:id/active', requirePermission('*'), logAudit('UPDATE', 'USER'), userController.toggleActive);

module.exports = router;
