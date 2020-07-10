const content = require('commonContent');
const paths = require('paths');
const mockData = require('test/e2e/data');

const appellant = mockData.appellant;

const languages = ['en'];

Feature('Full Journey');

languages.forEach(language => {
  const commonContent = content[language];

  Scenario(`${language.toUpperCase()} - Appellant full journey from /start-an-appeal to the /check-your-appeal page`, I => {
    I.amOnPage(`${paths.session.root}?lng=${language}`);
    I.wait(2);
    I.enterDetailsFromStartToNINO(commonContent);
    I.enterAppellantContactDetailsWithMobileAndContinue(commonContent, language, appellant.contactDetails.phoneNumber);
    I.checkOptionAndContinue(commonContent, '#doYouWantTextMsgReminders-yes');
    I.checkOptionAndContinue(commonContent, '#useSameNumber-yes');
    I.readSMSConfirmationAndContinue(commonContent);
  }).retry(1).tag('@smoke');
});
