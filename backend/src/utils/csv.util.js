const convertToCSV = (arr) => {
  if (!arr || !arr.length) return '';

  const headers = [
    'Employee Code',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Department',
    'Designation',
    'Status',
    'Salary',
    'Joining Date',
  ];

  const rows = arr.map((item) => [
    `"${item.employeeCode || ''}"`,
    `"${item.firstName || ''}"`,
    `"${item.lastName || ''}"`,
    `"${item.email || ''}"`,
    `"${item.phone || ''}"`,
    `"${item.department || ''}"`,
    `"${item.designation || ''}"`,
    `"${item.status || ''}"`,
    `"${item.salary || 0}"`,
    `"${item.joiningDate ? new Date(item.joiningDate).toISOString().split('T')[0] : ''}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

module.exports = { convertToCSV };
