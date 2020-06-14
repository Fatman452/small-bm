const { getActions } = require('../Transaction/Transaction');
const InvoiceTemplate = require('../SalesInvoice/InvoiceTemplate.vue').default;

module.exports = {
  name: 'AdjustSalesInvoice',
  label: 'Nota de Crédito',
  doctype: 'DocType',
  documentClass: require('./AdjustSalesInvoiceDocument'),
  printTemplate: InvoiceTemplate,
  isSingle: 0,
  isChild: 0,
  isSubmittable: 1,
  
  keywordFields: ['name', 'customer'],
  settings: 'AdjustSalesInvoiceSettings',
  fields: [
    {
      label: 'Número',
      fieldname: 'name',
      fieldtype: 'Data',
      required: 1,
      readOnly: 1
    },
    {
      fieldname: 'date',
      label: 'Fecha',
      fieldtype: 'Date',
      default: new Date().toISOString().slice(0, 10)
    },
    {
      fieldname: 'customer',
      label: 'Cliente',
      fieldtype: 'Link',
      target: 'Customer',
      required: 1
    },
    {
      fieldname: 'account',
      label: 'Cuenta',
      fieldtype: 'Link',
      target: 'Account',
      disableCreation: true,
      formula: doc => doc.getFrom('Party', doc.customer, 'defaultAccount'),
      getFilters: () => {
        return {
          isGroup: 0,
          accountType: 'Receivable'
        };
      }
    },
    {
      fieldname: 'currency',
      label: 'Moneda del Cliente',
      fieldtype: 'Link',
      target: 'Currency',
      formula: doc => doc.getFrom('Party', doc.customer, 'currency'),
      formulaDependsOn: ['customer']
    },
    {
      fieldname: 'exchangeRate',
      label: 'Tasa de intercambio',
      fieldtype: 'Float',
      formula: doc => doc.getExchangeRate(),
      readOnly: true
    },
    {
      fieldname: 'items',
      label: 'Productos',
      fieldtype: 'Table',
      childtype: 'AdjustSalesInvoiceItem',
      required: true
    },
    {
      fieldname: 'netTotal',
      label: 'Total Neto',
      fieldtype: 'Currency',
      formula: doc => doc.getSum('items', 'amount'),
      readOnly: 1,
      getCurrency: doc => doc.currency
    },
    {
      fieldname: 'baseNetTotal',
      label: 'Total Neto (Moneda Local)',
      fieldtype: 'Currency',
      formula: doc => doc.netTotal * doc.exchangeRate,
      readOnly: 1
    },
    {
      fieldname: 'taxes',
      label: 'Impuestos',
      fieldtype: 'Table',
      childtype: 'TaxSummary',
      formula: doc => doc.getTaxSummary(),
      readOnly: 1
    },
    {
      fieldname: 'grandTotal',
      label: 'Total',
      fieldtype: 'Currency',
      formula: doc => doc.getGrandTotal(),
      readOnly: 1,
      getCurrency: doc => doc.currency
    },
    {
      fieldname: 'baseGrandTotal',
      label: 'Total (Moneda Local)',
      fieldtype: 'Currency',
      formula: doc => doc.grandTotal * doc.exchangeRate,
      readOnly: 1
    },
    {
      fieldname: 'outstandingAmount',
      label: 'Monto Pendiente',
      fieldtype: 'Currency',
      formula: doc => {
        if (doc.submitted) return;
        return 0;
      },
      readOnly: 1
    },
    {
      fieldname: 'terms',
      label: 'Notas',
      fieldtype: 'Text'
    },
    {
      fieldname: 'voucherType',
      label: 'Tipo de Comprobante',
      placeholder: 'tipo de comprobante...',
      fieldtype: 'Link',
      target: 'VoucherType',
      default:'Nota de Crédito',
      disableCreation: true,
      getFilters: async () => {
        return {
          active: ['in', ['true', 1]],
          useOn: 'Ajuste'
        };
      }
    },
    {
      fieldname: 'voucherSerie',
      label: 'NCF',
      fieldtype: 'Data',
      formula: doc => {
        if (!(doc.submitted)) return;
        return doc.voucherSerie;
      }
    },
    {
      fieldname: 'affectedSerie', 
      label: 'NCF Modificado',
      fieldtype: 'Data', 
      default: ''
    }
  ],

  actions: getActions('AdjustSalesInvoice')
};
