const BenefitType = require('steps/start/benefit-type/BenefitType');
const sections = require('steps/check-your-appeal/sections');
const { expect } = require('test/util/chai');
const benefitTypes = require('steps/start/benefit-type/types');
const config = require('config');
const paths = require('paths');

describe('BenefitType.js', () => {
  let benefitType = null;

  beforeEach(() => {
    benefitType = new BenefitType({
      journey: {
        steps: {
          AppealFormDownload: paths.appealFormDownload,
          PostcodeChecker: paths.start.postcodeCheck,
          LanguagePreference: paths.start.languagePreference
        }
      }
    });
    benefitType.fields = { benefitType: {} };
  });

  describe('get path()', () => {
    it('returns path /benefit-type', () => {
      expect(BenefitType.path).to.equal(paths.start.benefitType);
    });
  });

  describe('get form()', () => {
    let fields = null;
    let field = null;

    before(() => {
      fields = benefitType.form.fields;
    });

    it('should contain 1 field', () => {
      expect(Object.keys(fields).length).to.equal(1);
      expect(fields).to.have.all.keys('benefitType');
    });

    describe('benefitType filed', () => {
      beforeEach(() => {
        field = fields.benefitType;
      });

      it('has constructor name FieldDescriptor', () => {
        expect(field.constructor.name).to.eq('FieldDescriptor');
      });

      it('contains validation', () => {
        expect(field.validations).to.not.be.empty;
      });
    });
  });

  describe('answers() and values()', () => {
    const question = 'A Question';
    const value = 'Personal Independence Payment (PIP)';

    beforeEach(() => {
      benefitType.content = { cya: { benefitType: { question } } };

      benefitType.fields = { benefitType: { value } };
    });

    it('should contain a single answer', () => {
      const answers = benefitType.answers();
      expect(answers.question).to.equal(question);
      expect(answers.section).to.equal(sections.benefitType);
      expect(answers.answer).to.equal(value);
    });

    it('should contain a value object', () => {
      const values = benefitType.values();
      expect(values).to.deep.equal({
        benefitType: {
          code: 'PIP',
          description: 'Personal Independence Payment'
        }
      });
    });
  });

  describe('next()', () => {
    it('returns /appeal-form-download when benefit type is not PIP', () => {
      benefitType.fields.benefitType.value = 'not PIP';
      expect(benefitType.next().step).to.eql(paths.appealFormDownload);
    });

    it('returns /postcode-check with benefit type value is PIP', () => {
      benefitType.fields.benefitType.value = 'Personal Independence Payment (PIP)';
      expect(benefitType.next().step).to.eql(paths.start.postcodeCheck);
    });

    it('pushes ESA as allowed benefitType if allowESA is enabled', () => {
      expect(Object.keys(benefitTypes).includes('employmentAndSupportAllowance'))
        .to.eql(config.get('features.allowESA.enabled') === 'true');
    });

    it('pushes UC as allowed benefitType if allowUC is enabled', () => {
      expect(Object.keys(benefitTypes).includes('universalCredit'))
        .to.eql(config.get('features.allowUC.enabled') === 'true');
    });

    it('pushes DLA as allowed benefitType if allowDLA is enabled', () => {
      expect(Object.keys(benefitTypes).includes('disabilityLivingAllowance'))
        .to.eql(config.get('features.allowDLA.enabled') === 'true');
    });

    it('does not push DLA as allowed benefitType when allowDLA is not enabled', () => {
      expect(!Object.keys(benefitTypes).includes('disabilityLivingAllowance'))
        .to.eql(config.get('features.allowDLA.enabled') === 'false');
    });

    it('returns /language-preference when Welsh feature toggle is on', () => {
      // eslint-disable-next-line no-process-env
      process.env.FT_WELSH = 'true';

      expect(benefitType.next()).to.eql({ nextStep: paths.start.languagePreference });

      // eslint-disable-next-line no-process-env
      process.env.FT_WELSH = 'false';
    });
  });
});
