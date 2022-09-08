import LightningDatatable from 'lightning/datatable';
import picklistColumn from './picklistColumn.html';
import lookupColumn from './lookupColumn.html';
 
export default class LWCCustomDatatableType extends LightningDatatable {
    static customTypes = {
        picklistColumn: {
            template: picklistColumn,
            standardCellLayout: true,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context', 'variant','name']
        },
        lookupColumn: {
            template: lookupColumn,
            standardCellLayout: true,
            typeAttributes: ['value', 'fieldName', 'object', 'context', 'name', 'fields', 'target']
        }
    };
}