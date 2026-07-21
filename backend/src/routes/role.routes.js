const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const { logAudit } = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', requirePermission('roles:read'), roleController.getRoles);
router.post('/', requirePermission('roles:create'), logAudit('CREATE', 'ROLES'), roleController.createRole);
router.put('/:id', requirePermission('roles:update'), logAudit('UPDATE', 'ROLES'), roleController.updateRole);

module.exports = router;
