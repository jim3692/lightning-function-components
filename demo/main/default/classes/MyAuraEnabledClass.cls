public with sharing class MyAuraEnabledClass {
    public class SelectedField {
        @AuraEnabled
        public String fieldApiName { get; set; }

        @AuraEnabled
        public String objectApiName { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static Account getAccount(Id recordId, List<SelectedField> fields) {
        String query = 'SELECT ';

        for (Integer i = 0; i < fields.size(); i++) {
            query += fields.get(i).fieldApiName;
            if (i <= fields.size() - 2) {
                query += ',';
            }
        }

        query += ' FROM ACCOUNT WHERE Id = :recordId';

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getAllAccounts() {
        return [SELECT Id, Name FROM Account];
    }

}
