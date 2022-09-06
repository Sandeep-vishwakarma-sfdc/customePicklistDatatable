import { LightningElement,api,track } from 'lwc';
// import Records_per_page from '@salesforce/label/c.Records_per_page'
// import Page from '@salesforce/label/c.Page'
// import oflabel from '@salesforce/label/c.of'
// import First from '@salesforce/label/c.First'
// import Next from '@salesforce/label/c.Next'
// import Previous from '@salesforce/label/c.Previous'
// import Last from '@salesforce/label/c.Last'

export default class PaginationCmp extends LightningElement {

    page = 1;
    options = [{'value':25,default:false},{'value':50,default:false},{'value':100,default:false}];

    set pagevalue(value){
        this.page = value;
    }
    @api get pagevalue(){
        return this.page;
    }

    set pageSizeValue(value){
        this.pageSize = Number(value);
        let opt = this.options.findIndex(op=>op.value==String(value));
        this.options[opt].default = true;
        console.log('options ',this.options);
    }
    @api get pageSizeValue(){
        return this.pageSize;
    }

    startingRecord = 1;
    endingRecord = 0;
    pageSize = 10;
    totalRecordCount = 0;
    @track totalPage = 0;
    items = [];
    @track disableBtn = {first:false,previous:false,next:false,last:false};
    
    tabledata;
    data = [];
    @api get tabledata(){
      return this.items;  
    }

    labels = {
        Records_per_page:'Records per page',
        Page:'Page',
        of:'of',
        First:'First',
        Previous:'Previous',
        Next:'Next',
        Last:'Last'
    }

    set tabledata(value){
        if(value){
            setTimeout(() => {
        this.data = JSON.parse(JSON.stringify(value));
        console.log('Pagination data ',this.data,'page ',this.page);
        this.totalRecordCount = this.data.length;
        this.totalPage = Math.ceil(this.totalRecordCount/this.pageSize);
        this.displayRecordPerPage(this.page);
        }, 500);
        }
    }
    
    get pageSizeOptions(){
        // return [10,20,50,100];
        return this.options;
    }

    handleRecordsPerPage(event){
        this.pageSize = event.target.value;
        this.page = 1;
        this.totalPage = Math.ceil(this.totalRecordCount/this.pageSize);
        this.displayRecordPerPage(this.page);
    }
    
    handlePrevious(){
        if(this.page>1){
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }
    handleNext(){
        if(this.page<this.totalPage && this.page!=this.totalPage){
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);
        }
    }

    handleFirst(){
        this.page = 1;
        this.displayRecordPerPage(this.page);
    }
    handleLast(){
        this.page = this.totalPage;
        this.displayRecordPerPage(this.page);
    }

    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecordCount) 
                            ? this.totalRecordCount : this.endingRecord; 

        this.items = this.data.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
        let objlist = {values:this.items,currentPage:this.page}
        if(this.querySelector('.pagenumber')){
            this.querySelector('.pagenumber').innerHTML = `${this.labels.Page}: ${this.page} ${this.labels.of} ${this.totalPage}`;
        }
        this.checkNextPreviousbtn(this.page,this.totalPage);
        this.dispatchEvent(new CustomEvent('action',{detail:objlist}))
    }

    checkNextPreviousbtn(page,totalpage){
        if(totalpage>=page+1){
          this.disableBtn.next = false;
        }else{
            this.disableBtn.next = true;
        }
        if(page>1){
            this.disableBtn.previous = false;
        }else{
            this.disableBtn.previous = true;
        }
        if(page==1||page==0){
            this.disableBtn.first = true;
        }else{
            this.disableBtn.first = false;
        }
        if(page==totalpage){
            this.disableBtn.last = true;
        }else{
            this.disableBtn.last = false;
        }
      }
}