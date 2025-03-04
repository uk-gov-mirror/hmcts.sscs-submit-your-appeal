/* eslint-disable no-process-env */

const language = 'cy';

const content = require('commonContent');
const testData = require(`test/e2e/data.${language}`);

const testDataEn = require('test/e2e/data.en');

Feature(`${language.toUpperCase()} - DLA E2E SYA - Full Journey`);

Scenario(`${language.toUpperCase()} - DLA E2E SYA Journey @fullfunctional`, I => {
  const benefitCode = testDataEn.benefitTypes[3].code;
  const office = testDataEn.benefitTypes[3].office;
  const commonContent = content[language];
  I.createTheSession(language);
  I.wait(2);
  I.enterCaseDetailsFromStartToNINO(commonContent, language, benefitCode, office);
  I.enterAppellantContactDetailsWithMobileAndContinue(commonContent, language, '07411222222');
  I.checkOptionAndContinue(commonContent, '#doYouWantTextMsgReminders-yes');
  I.checkOptionAndContinue(commonContent, '#useSameNumber-yes');
  I.readSMSConfirmationAndContinue(commonContent);
  I.enterDetailsFromNoRepresentativeToUploadingEvidence(commonContent);
  I.enterDoYouWantToAttendTheHearing(commonContent, '#attendHearing-yes');
  I.selectTelephoneHearingOptionsAndContinue(commonContent);
  I.selectDoYouNeedSupportAndContinue(commonContent, '#arrangements-no');
  I.selectHearingAvailabilityAndContinue(commonContent, '#scheduleHearing-no');
  I.completeAllPcqCY();
  I.checkYourAppealToConfirmationPage(language, testData.signAndSubmit.signer);
  I.endTheSession();
}).retry(1);
