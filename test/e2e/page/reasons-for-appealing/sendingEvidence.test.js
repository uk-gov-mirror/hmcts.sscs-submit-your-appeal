const content = require('commonContent');
const sendingEvidenceContentEn = require('steps/reasons-for-appealing/sending-evidence/content.en');
const sendingEvidenceContentCy = require('steps/reasons-for-appealing/sending-evidence/content.cy');
const paths = require('paths');

const evidenceUploadEnabled = require('config').get('features.evidenceUpload.enabled');

const languages = ['en', 'cy'];

Feature('Sending Evidence - appellant contact details @evidence-upload @batch-10');

if (!evidenceUploadEnabled) {
  languages.forEach(language => {
    Before(I => {
      I.createTheSession(language);
      I.amOnPage(paths.identity.enterAppellantContactDetails);
    });

    After(I => {
      I.endTheSession();
    });

    const commonContent = content[language];
    const sendingEvidenceContent = language === 'en' ? sendingEvidenceContentEn : sendingEvidenceContentCy;

    Scenario(`${language.toUpperCase()} - When I omit my email address I see the correct content on /sending-evidence`, I => {
      I.enterAppellantContactDetailsAndContinue(commonContent, language);
      I.amOnPage(paths.reasonsForAppealing.sendingEvidence);
      I.see(sendingEvidenceContent.postEvidence);
    });

    Scenario(`${language.toUpperCase()} - When I add my email address I should see the correct content on /sending-evidence`, I => {
      I.enterAppellantContactDetailsWithEmailAndContinue();
      I.amOnPage(paths.reasonsForAppealing.sendingEvidence);
      I.see(sendingEvidenceContent.postEvidenceWithEmail);
    });

    Scenario(`${language.toUpperCase()} - When I go to the /sending-evidence page I see the title`, I => {
      I.enterAppellantContactDetailsAndContinue(commonContent, language);
      I.amOnPage(paths.reasonsForAppealing.sendingEvidence);
      I.see(sendingEvidenceContent.title);
    });

    Scenario(`${language.toUpperCase()} - When clicking continue I see the correct path`, I => {
      I.enterAppellantContactDetailsAndContinue(commonContent, language);
      I.amOnPage(paths.reasonsForAppealing.sendingEvidence);
      I.click(commonContent.continue);
      I.seeInCurrentUrl(paths.hearing.theHearing);
    });
  });
}
