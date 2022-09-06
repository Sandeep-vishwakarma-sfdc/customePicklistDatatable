import { LightningElement,track,api,wire } from 'lwc';
import getSkillsBasedOnSpeciality from '@salesforce/apex/SkillsAndScenarios.getSkillsBasedOnSpeciality';
import getAllSkills from '@salesforce/apex/SkillsAndScenarios.getAllSkills';
import getScenarios from '@salesforce/apex/SkillsAndScenarios.getScenarios';
import HCP_Scenario_OBJECT from '@salesforce/schema/HCP_Scenario__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import Avant_Skill_Level from '@salesforce/schema/HCP_Scenario__c.Avant_Skill_Level__c';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import updateScenario from '@salesforce/apex/SkillsAndScenarios.updateScenario';
import updateSkillsAndCreateHCPSkills from '@salesforce/apex/SkillsAndScenarios.updateSkillsAndCreateHCPSkills';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Speciality', fieldName: 'Specialty_AV__r.Name' },
    { label: 'Skill Description', fieldName: 'Skill_Description_AV__c' },
    {
        label: 'Avant Skill Level', fieldName: 'Avant_Skill_Level__c', type: 'picklistColumn', editable: false, typeAttributes: {
            placeholder: 'Choose Type', options: { fieldName: 'pickListOptions' }, 
            value: { fieldName: 'Avant_Skill_Level__c' }, // default value for picklist,
            context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
        }
    },
    { label: 'Recruitment Skills Notes', fieldName: 'Recruitment_Skills_Notes__c',type:'text',editable:true },
    
    { label:'Query Action', type:'button',fixedWidth:150, typeAttributes:{label:'Query',name:'Query',varient:'brand'} },
    {
        label: 'Query',
        fieldName: '',
        cellAttributes: { iconName: { fieldName: 'isQuery' } }
    }
];
const scenarioColumn = [
    // { label: 'Name', fieldName: 'Name',type:'text' },
    { label: 'Specialty Name', fieldName: 'Specialty_AV__r.Name',type:'text' },
    { label: 'ScenarioCondition', fieldName: 'ScenarioCondition',type:'text' },
    { label: 'Complication', fieldName: 'Complication',type:'text' },
    { label: 'WorkHistory', fieldName: 'WorkHistory',type:'text' },
    {
        label: 'Avant Skill Level', fieldName: 'Avant_Skill_Level__c', type: 'picklistColumn', editable: false, typeAttributes: {
            placeholder: 'Choose Type', options: { fieldName: 'pickListOptions' }, 
            value: { fieldName: 'Avant_Skill_Level__c' }, // default value for picklist,
            context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
        }
    },
    { label: 'Scenario Notes', fieldName: 'Scenario_Notes__c',type:'text',editable:true },

]
// https://techdicer.com/picklist-in-lwc-datatable-inline-edit/
export default class SkillsAndScenarios extends LightningElement {
    @track paginatedskills = [];
    @track skills = [];
    skilsBasedOnspeciality = [];
    allSkils = [];
    @api recordId;
    columns = columns;
    toogleIsActive = false;
    modalContainer = false;
    showLoading = false;
    scenarious = [];
    scenarioColumn = scenarioColumn;
    saveDraftValues =[];
    @track pickListOptions=[];
    lastSavedData = [];
    modelPopup = true;
    skillId = '';

    @wire(getObjectInfo, { objectApiName: HCP_Scenario_OBJECT })
    objectInfo;
 
    //fetch picklist options
    @wire(getPicklistValues, {
        recordTypeId: "$objectInfo.data.defaultRecordTypeId",
        fieldApiName: Avant_Skill_Level
    })
    wirePickList({ error, data }) {
        if (data) {
            this.pickListOptions = data.values;
        } else if (error) {
            console.log(error);
        }
    }

    renderedCallback(){
        let picklist = this.template.querySelector('.picklist-section')
        console.log('picklist ',picklist);
    }

    connectedCallback(){
        console.log('Record Id '+this.recordId);
        this.showLoading = true;
        getSkillsBasedOnSpeciality({recordId:this.recordId}).then(skills => {
            this.skilsBasedOnspeciality = JSON.parse(JSON.stringify(skills));
            console.log('Skills ',this.skilsBasedOnspeciality);
            this.skilsBasedOnspeciality = skills.map(element => {
                let obj = {
                    'Id':element.Id,
                    'Name':element.Name,
                    'Specialty_AV__c':element.Specialty_AV__c,
                    'Skill_Description_AV__c':element.Skill_Description_AV__c,
                    'Specialty_AV__r.Name':element.Specialty_AV__r.Name,
                    'Avant_Skill_Level__c':element.Avant_Skill_Level__c,
                    'Recruitment_Skills_Notes__c':element.Recruitment_Skills_Notes__c,
                    'isQuery':element.isHCPScenarioQuery__c?'action:approval':'action:close',
                }
                return obj;
            });
            this.skilsBasedOnspeciality.forEach(ele => {
                // ele.Avant_Skill_Level__c = [{label:'test',value:'test'},{label:'test1',value:'test1'}]
                ele.pickListOptions = this.pickListOptions;
            });
            this.skills = this.skilsBasedOnspeciality;
            setTimeout(() => {
                this.paginatedskills = this.skills;
                this.showLoading = false;
            }, 200);
        }).catch(error=>{
            console.log('error  ',error);
        });


        getAllSkills().then(skills=>{
            this.allSkils = JSON.parse(JSON.stringify(skills));
            console.log('All skills ',skills);
            this.allSkils = skills.map(element => {
                let obj = {
                    'Id':element.Id,
                    'Name':element.Name,
                    'Specialty_AV__c':element.Specialty_AV__c,
                    'Skill_Description_AV__c':element.Skill_Description_AV__c,
                    'Specialty_AV__r.Name':element.Specialty_AV__r?element.Specialty_AV__r.Name:'',
                    'isQuery':element.isHCPScenarioQuery__c?'action:approval':'action:close',
                }
                return obj;
            });
            this.allSkils.forEach(ele => {
                ele.pickListOptions = this.pickListOptions;
            });
            
        });
    }

    renderedCallback(){
       
    }
   

    handleRowAction(event){
        this.modalContainer = true;
        this.saveDraftValues = [];
        console.log('Row ',event.detail.row);
        this.skillId = event.detail.row.Id;
        console.log('Row ',event.detail.action.name);
        let specialtyId = event.detail.row.Specialty_AV__c;
        getScenarios({specialityId:specialtyId}).then(specialities=>{
            this.scenarious = JSON.parse(JSON.stringify(specialities));
            
            this.scenarious = this.scenarious.map(ele=>{
                let obj = {
                    'Id':ele.ScenarioId,
                    'Name':ele.ScenarioName,
                    'Specialty_AV__r.Name':ele.SpecialtyName,
                    'ScenarioCondition':ele.ScenarioCondition,
                    'Complication':ele.Complication,
                    'HCPSenarioId':ele.HCPScenarioId,
                    'WorkHistory':ele.workHistroryName,
                    'Avant_Skill_Level__c':'',
                    'Scenario_Notes__c':'',
                    
                }
                return obj;
            });
            this.scenarious.forEach(ele => {
                // ele.Avant_Skill_Level__c = [{label:'test',value:'test'},{label:'test1',value:'test1'}]
                ele.pickListOptions = this.pickListOptions;
            });

            console.log('this.scenarious ',this.scenarious);
        }).catch(err=>{
            console.log('Error getScenarios',err );
        })
    }
    handleSave(event){
        // this.saveDraftValues = event.detail.draftValues;
        let recordInputs = this.saveDraftValues.slice().map(draft=>{
            let fields = Object.assign({},draft);
            return fields;
        });
        console.log('Draft ',recordInputs);
        let objScenario = recordInputs.map(ele=>{
            let obj = {
                Id:ele.Id,
                AvantSkillLevel:ele.Avant_Skill_Level__c,
                RecruitmentSkillsNotes:ele.Scenario_Notes__c,
                SkillId:this.skillId
            }
            return obj;
        })
        let updateObj = JSON.stringify(objScenario);
        console.log('updateObj ',updateObj);
        updateScenario({scenario:updateObj}).then(data=>{
            console.log('Data updated ',data);
            if(data,length > 0){
                this.showToast('SUCCESS','Scenario Saved','success');
            }else{
                this.showToast('WARNING','Avant skill cannot be blank','warning');
            }
            this.modalContainer = false;
        }).catch(error=>{
            console.log('error  ',error);
            this.showToast('ERROR','Failed','error');
        });
    }

    handleSaveSkills(event){
        let recordInputs = this.saveDraftValues.slice().map(draft=>{
            let fields = Object.assign({},draft);
            return fields;
        });
        console.log('Draft ',recordInputs);
        let updateObj = JSON.stringify(recordInputs);
        console.log('updateObj ',updateObj);
        updateSkillsAndCreateHCPSkills({NFskills:updateObj}).then(HCPSKills=>{
            console.log('HCP Skills',HCPSKills);
            if(HCPSKills.length >0){
                this.showToast('SUCCESS','HCP Skills Created','success');
            }else{
                this.showToast('WARNING','Avant skill cannot be blank','warning');
            }
        }).catch(error=>{
            console.log('Error ',error);
            this.showToast('ERROR','Failed','error');
        })
    }

    handleCellChange(event) {
        console.log('handleCellChange ',event.detail.draftValues[0]);
        this.updateDraftValues(event.detail.draftValues[0]);
    }
    handleCancel(event){

    }
    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.saveDraftValues];
        console.log('saveDraftValues ',this.saveDraftValues);
        //store changed value to do operations
        //on save. This will enable inline editing &
        //show standard cancel & save button
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
 
        if (draftValueChanged) {
            this.saveDraftValues = [...copyDraftValues];
            console.log('saveDraftValues draftValueChanged true',this.saveDraftValues);
        } else {
            this.saveDraftValues = [...copyDraftValues, updateItem];
            console.log('saveDraftValues draftValueChanged false',this.saveDraftValues);
        }
    }
    picklistChanged(event) {
        event.stopPropagation();
        let dataRecieved = event.detail.data;
        let updatedItem = { Id: dataRecieved.context, Avant_Skill_Level__c: dataRecieved.value };
        console.log(updatedItem);
        this.updateDraftValues(updatedItem);
        this.updateDataValues(updatedItem);
    }
    updateDataValues(updateItem) {
        let copyData = JSON.parse(JSON.stringify(this.scenarious));
 
        copyData.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
 
        //write changes back to original data
        this.scenarious = [...copyData];
    }
    handleChangeToggle(event){
        console.log('Checked ',event.target.checked);
        this.toogleIsActive = event.target.checked;
        this.showLoading = true;
        if(this.toogleIsActive){
            setTimeout(() => {
                this.showLoading = false;
                this.skills = this.allSkils;
            }, 200);
        }else{
            setTimeout(() => {
                this.showLoading = false;
                this.skills = this.skilsBasedOnspeciality;
            }, 200);
        }
    }
    handlePaginationAction(event){
        setTimeout(() => {
            console.log('curret Page ', event.detail.currentPage);
            this.paginatedskills = event.detail.values;
        }, 200);
    }
    closeModalAction(){
        this.modalContainer = false;
        this.saveDraftValues = [];
    }
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
        this.saveDraftValues = [];
    }
}