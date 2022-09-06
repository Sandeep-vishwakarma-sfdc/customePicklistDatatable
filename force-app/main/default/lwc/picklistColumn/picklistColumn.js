import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import LWCDatatablePicklist from '@salesforce/resourceUrl/LWCDatatablePicklist';
 
export default class PicklistColumn extends LightningElement {
    @api label;
    @api placeholder;
    @api options;
    @api value;
    @api context;
    @track showPicklist = false;
 
    renderedCallback() {
        Promise.all([
            loadStyle(this, LWCDatatablePicklist),
        ]).then(() => { });
 
        this.template.querySelector("lightning-combobox")?.focus();
    }
 
    closePicklist() {
        this.showPicklist = false;
    }
 
    handleChange(event) {
        //show the selected value on UI
        this.value = event.detail.value;
 
        //fire event to send context and selected value to the data table
        this.dispatchEvent(new CustomEvent('picklistchanged', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                data: { context: this.context, value: this.value }
            }
        }));
    }
 
    handleClick(event) {
        this.showPicklist = true;
    }
}