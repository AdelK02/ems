const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
const { logAudit } = require('../middleware/audit.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

router.get('/export/csv', requirePermission('employees:read'), logAudit('EXPORT_CSV', 'EMPLOYEES'), employeeController.exportCSV);

router.get('/', requirePermission('employees:read'), employeeController.getEmployees);
router.get('/:id', requirePermission('employees:read'), employeeController.getEmployeeById);

router.post(
  '/',
  requirePermission('employees:create'),
  upload.single('avatar'),
  logAudit('CREATE', 'EMPLOYEES'),
  employeeController.createEmployee
);

router.put(
  '/:id',
  requirePermission('employees:update'),
  upload.single('avatar'),
  logAudit('UPDATE', 'EMPLOYEES'),
  employeeController.updateEmployee
);

router.delete(
  '/:id',
  requirePermission('employees:delete'),
  logAudit('DELETE', 'EMPLOYEES'),
  employeeController.deleteEmployee
);

module.exports = router;
