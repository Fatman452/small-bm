const frappe = require('frappejs');

module.exports = {
  title: 'Balance Sheet',
  method: 'balance-sheet',
  filterFields: [
    {
      fieldtype: 'Date',
      fieldname: 'toDate',
      size: 'small',
      placeholder: 'Hasta',
      label: 'Hasta',
      required: 1,
      default: async () => {
        return (await frappe.getSingle('AccountingSettings')).fiscalYearEnd;
      }
    },
    {
      fieldtype: 'Select',
      size: 'small',
      options: [
        'Select Period...',
        'Monthly',
        'Quarterly',
        'Half Yearly',
        'Yearly'
      ],
      label: 'Periodicidad',
      fieldname: 'periodicity',
      default: 'Monthly'
    }
  ],
  getColumns(data) {
    const columns = [
      { label: 'Cuenta', fieldtype: 'Data', fieldname: 'account', width: 2 }
    ];

    if (data && data.columns) {
      const currencyColumns = data.columns;
      const columnDefs = currencyColumns.map(name => ({
        label: name,
        fieldname: name,
        fieldtype: 'Currency'
      }));

      columns.push(...columnDefs);
    }

    return columns;
  }
};
