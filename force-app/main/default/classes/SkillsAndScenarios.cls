public with sharing class SkillsAndScenarios {
    
    @AuraEnabled
    public static List<NF_Skill__c> getSkillsBasedOnSpeciality(String recordId){
       NF_HCP_Recruitment__c hcpRecruitment = getRecordInfo(recordId);
       Skills_Type__c skillTypeClinicalRecruitment = getSkillsType();
       List<NF_Skill__c> skills = new List<NF_Skill__c>();
       System.debug('Speciality '+hcpRecruitment.Application__r.Specialty__c);
       System.debug('Skill type '+skillTypeClinicalRecruitment.Id);
       skills = [select id,Name,Specialty_AV__c,Specialty_AV__r.Name,Skill_Description_AV__c,Skills_Type__c,isHCPScenarioQuery__c,Avant_Skill_Level__c,Recruitment_Skills_Notes__c,Skill_Sort_Order__c from NF_Skill__c where Specialty_AV__c=:hcpRecruitment.Application__r.Specialty__c and Skills_Type__c=:skillTypeClinicalRecruitment.Id order by Skill_Sort_Order__c desc];
       System.debug('skills  '+skills);
       return skills;
    }
    
    @AuraEnabled
    public static List<NF_Skill__c> getAllSkills(){
       List<NF_Skill__c> skills = new List<NF_Skill__c>();
       skills = [select id,Name,Specialty_AV__c,Specialty_AV__r.Name,Skill_Description_AV__c,Skills_Type__c,isHCPScenarioQuery__c,Avant_Skill_Level__c,Recruitment_Skills_Notes__c,Skill_Sort_Order__c from NF_Skill__c where Specialty_AV__c!=null order by Skill_Sort_Order__c desc];
       System.debug('skills  '+skills);
       return skills;
    }

    private static NF_HCP_Recruitment__c getRecordInfo(String recordId){
        NF_HCP_Recruitment__c hcpRecuritment = new NF_HCP_Recruitment__c();
        hcpRecuritment = [select Id,Name,Application__r.Specialty__c from NF_HCP_Recruitment__c where Id=:recordId and Application__c!=null];
        System.debug('hcpRecuritment'+hcpRecuritment.Application__r.Specialty__c);
        if(!String.isEmpty(hcpRecuritment.Application__r.Specialty__c)){
            return hcpRecuritment;
        }
        return null;
    }

    private static Skills_Type__c getSkillsType(){
        Skills_Type__c skillType = new Skills_Type__c();
        skillType = [select id,Name from Skills_Type__c where Name='Clinical Recruitment' limit 1];
        System.debug('skills type '+skillType);
        return skillType;
    }
    @AuraEnabled
    public static List<SkillsAndScenarios.ScenarioWorkHistory> getScenarios(String specialityId){
       List<Scenario_AV__c> scenarios = [select Id,Name,Specialty_AV__c,Specialty_AV__r.Name,Work_History__c,Work_History__r.Name,Scenario_Condition_AV__c from Scenario_AV__c where Specialty_AV__c =:specialityId];

       List<HCP_Scenario__c> hcpScenarios = [select Id,Name,Work_History__c,Work_History__r.Name,Skill__c,Scenario__c,Scenario_Condition__c,Scenario_Condition__r.Name,Scenario_Complication__c from HCP_Scenario__c where Work_History__c!=null and Skill__c!=null];
       Map<String,HCP_Scenario__c> hcpScenarioMap = new Map<String,HCP_Scenario__c>();
       for(HCP_Scenario__c hcps: hcpScenarios){
            hcpScenarioMap.put(hcps.Scenario__c,hcps);
       }

       List<SkillsAndScenarios.ScenarioWorkHistory> ScenarioWorkHistories = new List<SkillsAndScenarios.ScenarioWorkHistory>();
       for(Scenario_AV__c s:scenarios){
        SkillsAndScenarios.ScenarioWorkHistory swh = new SkillsAndScenarios.ScenarioWorkHistory();
        swh.ScenarioId = s.Id;
        swh.ScenarioName = s.Name;
        swh.SpecialtyId = s.Specialty_AV__c;
        swh.SpecialtyName = s.Specialty_AV__c!=null?s.Specialty_AV__r.Name:'';
        if(hcpScenarioMap.get(s.Id)!=null){
        swh.workHistroryId = hcpScenarioMap.get(s.Id)!=null?hcpScenarioMap.get(s.Id).Work_History__c:'';
        swh.workHistroryName = hcpScenarioMap.get(s.Id)!=null?hcpScenarioMap.get(s.Id).Work_History__r.Name:'';
        swh.ScenarioCondition = hcpScenarioMap.get(s.Id).Scenario_Condition__c!=null?hcpScenarioMap.get(s.Id).Scenario_Condition__r.Name:'';
        swh.Complication = hcpScenarioMap.get(s.Id)!=null?hcpScenarioMap.get(s.Id).Scenario_Complication__c:'';
        swh.HCPScenarioId = hcpScenarioMap.get(s.Id)!=null?hcpScenarioMap.get(s.Id).Id:'';
        }
        ScenarioWorkHistories.add(swh);
       }
       
       return ScenarioWorkHistories;
    }
    @AuraEnabled
    public static List<NF_HCP_Skill__c>  updateScenario(String scenario){
        List<ScenarioWrapper> scenarios = (List<ScenarioWrapper>)JSON.deserialize(scenario, List<ScenarioWrapper>.class);
        List<NF_HCP_Skill__c> hcpSkills = new List<NF_HCP_Skill__c>();
        List<HCP_Scenario__c> hcpScenaios = new List<HCP_Scenario__c>();
        List<String> skillIds = new List<String>();
        for(ScenarioWrapper wrapper:scenarios){
            NF_HCP_Skill__c hcpSkill = new NF_HCP_Skill__c();
            hcpSkill.NF_Avant_Skill_Level__c = wrapper.AvantSkillLevel;
            hcpSkill.Recruitment_Skills_Notes__c = wrapper.RecruitmentSkillsNotes;
            hcpSkill.NF_Skill__c = wrapper.SkillId;
            hcpSkill.Work_History__c = wrapper.workHistroryId;
            hcpSkills.add(hcpSkill);
            skillIds.add(wrapper.SkillId);
        }
        insert hcpSkills;


        List<HCP_Scenario__c> hcpScenarios = [select Id,Name,Scenario__r.Specialty_AV__c,Avant_Skill_Level__c,Scenario_Notes__c,Skill__c,HCP_Skill__c from HCP_Scenario__c where Skill__c IN:skillIds];

        
        Map<String,NF_HCP_Skill__c> mapHCPSkills = new Map<String,NF_HCP_Skill__c>();
        for(NF_HCP_Skill__c hs:hcpSkills){
            mapHCPSkills.put(hs.NF_Skill__c,hs);
        }

        for(HCP_Scenario__c hcpsnc:hcpScenarios){
            hcpsnc.HCP_Skill__c = mapHCPSkills.get(hcpsnc.Skill__c).Id;
            hcpScenaios.add(hcpsnc);
        }
        update hcpScenaios;
        List<NF_Skill__c> skills = [select id,isHCPScenarioQuery__c from NF_Skill__c where Id IN:skillIds];
        for(NF_Skill__c skill:skills){
            skill.isHCPScenarioQuery__c = true;
        }
        update skills;
        return hcpSkills;
    }
    
    @AuraEnabled
    public static List<NF_HCP_Skill__c> updateSkillsAndCreateHCPSkills(String NFskills){
        List<NF_Skill__c> skills = (List<NF_Skill__c>)JSON.deserialize(NFskills, List<NF_Skill__c>.class);
        System.debug('hcpScenario'+skills);
        for(NF_Skill__c skill:skills){
            skill.isHCPScenarioQuery__c = true;
        }
        update skills;
        List<NF_HCP_Skill__c> hcpSkills = new List<NF_HCP_Skill__c>();
        for(NF_Skill__c skill:skills){
            NF_HCP_Skill__c hcpSkill = new NF_HCP_Skill__c();
            hcpSkill.NF_Avant_Skill_Level__c = skill.Avant_Skill_Level__c;
            hcpSkill.Recruitment_Skills_Notes__c = skill.Recruitment_Skills_Notes__c;
            // hcpSkill.NF_Skill_Assessment__c = 
            hcpSkill.NF_Skill__c = skill.Id;
            if(!String.isBlank(skill.Avant_Skill_Level__c)){
                hcpSkills.add(hcpSkill);
            }
        }
        insert hcpSkills;
        return hcpSkills;
    }

    public class ScenarioWrapper{
        @AuraEnabled public String Id;
        @AuraEnabled public String AvantSkillLevel;
        @AuraEnabled public String RecruitmentSkillsNotes;
        @AuraEnabled public String SkillId;
        @AuraEnabled public String workHistroryId;

    }

    public class ScenarioWorkHistory{
        @AuraEnabled public String ScenarioId;
        @AuraEnabled public String ScenarioName;
        @AuraEnabled public String SpecialtyId;
        @AuraEnabled public String SpecialtyName;
        @AuraEnabled public String workHistroryId;
        @AuraEnabled public String workHistroryName;
        @AuraEnabled public String ScenarioCondition;
        @AuraEnabled public String Complication;
        @AuraEnabled public String HCPScenarioId;
    }

}