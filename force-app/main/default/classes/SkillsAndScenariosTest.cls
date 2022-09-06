@isTest
public with sharing class SkillsAndScenariosTest {

    @TestSetup
    static void makeData(){
        // NF_HCP_Recruitment__c
        // NF_Skill__c
        // Application__c
        // Specialty__c
        // Skills_Type__c
        // HCP_Scenario__c
		
		Specialty__c speciality = new Specialty__c();
		speciality.Name = 'Test';
        insert speciality;
		
		
        Skills_Type__c skillType = new Skills_Type__c();
		skillType.Name = 'Clinical Recruitment';
        insert skillType;
		
        Application__c application = new Application__c();
		application.Name = 'TestApplication';
		application.Specialty__c = speciality.Id;
        insert application;

        NF_HCP_Recruitment__c hcpRecruitment = new NF_HCP_Recruitment__c();
		hcpRecruitment.Name = 'TestRequirement';
        hcpRecruitment.Application__c = application.Id;
        insert hcpRecruitment;

        NF_Skill__c skill = new NF_Skill__c();
		skill.Name = 'TestSkill';
		skill.Specialty_AV__c = speciality.Id;
		skill.Skills_Type__c = skillType.Id;
        insert skill;
		
        Scenario_Condition_AV__c scenarioCondition = new Scenario_Condition_AV__c();
        scenarioCondition.Name = 'TestScenarioCondition';
        insert scenarioCondition;
        
		Scenario_AV__c scenario = new Scenario_AV__c();
		scenario.Specialty_AV__c = speciality.Id;
        scenario.Scenario_Condition_AV__c = scenarioCondition.Id;
		insert scenario;

        HCP_Scenario__c hcpscenario = new HCP_Scenario__c();
		hcpscenario.Name = 'TestHcpScenario';
		hcpscenario.Scenario__c = scenario.Id;
        insert hcpscenario;
    }
    
    @isTest
    public static void test(){
        NF_HCP_Recruitment__c hcpRecruitment = [select Id,Name from NF_HCP_Recruitment__c limit 1];
        Specialty__c speciality = [select Id,Name from Specialty__c limit 1];
        List<NF_Skill__c> skills = [select Id,Name from NF_Skill__c];
        List<HCP_Scenario__c> scenarios = [select Id,Name from HCP_Scenario__c];
        String scenarioStr = JSON.serialize(scenarios);
        String skillStr = JSON.serialize(skills);
        SkillsAndScenarios.getSkillsBasedOnSpeciality(hcpRecruitment.Id);
        SkillsAndScenarios.getAllSkills();
        SkillsAndScenarios.getScenarios(speciality.Id);
        SkillsAndScenarios.updateSkillsAndCreateHCPSkills(skillStr);
        SkillsAndScenarios.updateScenario(scenarioStr);
    }
}