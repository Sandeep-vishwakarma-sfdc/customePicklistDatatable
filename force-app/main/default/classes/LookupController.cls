public with sharing class LookupController {
    @AuraEnabled (cacheable=true)
    public static List<Scenario_AV__c> fetchContact(){
        return [SELECT Id, Name, Work_History__c, Work_History__r.Name FROM Scenario_AV__c LIMIT 10];       
    }
}