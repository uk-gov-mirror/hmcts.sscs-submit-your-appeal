/* eslint-disable max-len */
const { expect } = require('test/util/chai');
const RepresentativeDetails = require('steps/representative/representative-details/RepresentativeDetails');
const paths = require('paths');
const userAnswer = require('utils/answer');
const sinon = require('sinon');
const config = require('config');

describe('RepresentativeDetails.js', () => {
  let representativeDetails = null;
  const isPostCodeLookupEnabled = config.postcodeLookup.enabled === 'true';

  beforeEach(() => {
    representativeDetails = new RepresentativeDetails({
      journey: {
        steps: {
          ReasonForAppealing: paths.reasonsForAppealing.reasonForAppealing
        }
      },
      session: {}
    });

    representativeDetails.fields = {
      name: {
        title: { value: '' },
        first: { value: '' },
        last: { value: '' },
        organisation: { value: '' }
      },
      postcodeLookup: { value: '' },
      postcodeAddress: { value: '' },
      addressLine1: { value: '' },
      addressLine2: { value: '' },
      townCity: { value: '' },
      county: { value: '' },
      postCode: { value: '' },
      phoneNumber: { value: '' },
      emailAddress: { value: '' }
    };
  });

  describe('get path()', () => {
    it('returns path /representative-details', () => {
      expect(RepresentativeDetails.path).to.equal(paths.representative.representativeDetails);
    });
  });

  describe('handler()', () => {
    let pclSpy = '';

    beforeEach(() => {
      pclSpy = sinon.spy(representativeDetails.pcl, 'init');
    });

    afterEach(() => {
      representativeDetails.pcl.init.restore();
    });

    const req = { method: 'GET', body: {}, session: {}, query: {} };
    const next = sinon.spy();
    const redirect = sinon.spy();
    const res = { redirect };
    it('call pcl controller once', () => {
      representativeDetails.req = req;
      representativeDetails.handler(req, res, next);
      expect(pclSpy).to.have.been.calledOnce;
    });
  });

  describe('get getCYAName()', () => {
    beforeEach(() => {
      representativeDetails.fields.name.first.value = '';
      representativeDetails.fields.name.last.value = '';
    });

    [
      'MR,HARRY,POTTER',
      'mr,harry,potter',
      'mR,haRRy,pOttEr',
      'Mr,harry John,pOttEr'
    ].forEach(item => {
      it(`should normalise reps full name # ${item}`, () => {
        representativeDetails.fields.name.title.value = item.split(',')[0];
        representativeDetails.fields.name.first.value = item.split(',')[1];
        representativeDetails.fields.name.last.value = item.split(',')[2];
        expect(representativeDetails.CYAName).to.equal('Mr Harry Potter');
      });
    });

    it('should return Not Provided if firstName or lastName has not been set', () => {
      expect(representativeDetails.CYAName).to.equal(userAnswer.NOT_PROVIDED);
    });

    it('should return the firstName if only the firstName has been set', () => {
      representativeDetails.fields.name.first.value = 'FirstName';
      expect(representativeDetails.CYAName).to.equal('Firstname');
    });

    it('should return the lastName if only the lastName has been set', () => {
      representativeDetails.fields.name.last.value = 'LastName';
      expect(representativeDetails.CYAName).to.equal('Lastname');
    });

    it('should return the full name if both firstName and lastName has been set', () => {
      representativeDetails.fields.name.first.value = 'FirstName';
      representativeDetails.fields.name.last.value = 'LastName';
      expect(representativeDetails.CYAName).to.equal('Firstname Lastname');
    });

    it('should return the full name without whitespace before or after the name', () => {
      representativeDetails.fields.name.first.value = '    FirstName';
      representativeDetails.fields.name.last.value = 'LastName    ';
      expect(representativeDetails.CYAName).to.equal('Firstname Lastname');
    });

    it('should return the first name without whitespace before or after the name', () => {
      representativeDetails.fields.name.first.value = '    FirstName    ';
      expect(representativeDetails.CYAName).to.equal('Firstname');
    });

    it('should return the last name without whitespace before or after the name', () => {
      representativeDetails.fields.name.last.value = '  LastName ';
      expect(representativeDetails.CYAName).to.equal('Lastname');
    });
  });

  describe('get CYAOrganisation()', () => {
    it('should return Not Provided if there is no organisation value', () => {
      expect(representativeDetails.CYAOrganisation).to.equal(userAnswer.NOT_PROVIDED);
    });

    it('should return the organisation if an organisation value has been set', () => {
      representativeDetails.fields.name.organisation.value = 'Organisation';
      expect(representativeDetails.CYAOrganisation).to.equal(representativeDetails.fields.name.organisation.value);
    });
  });

  describe('get CYAPhoneNumber()', () => {
    it('should return Not Provided if there is no phoneNumber value', () => {
      expect(representativeDetails.CYAPhoneNumber).to.equal(userAnswer.NOT_PROVIDED);
    });

    it('should return the phone number if a phoneNumber value has been set', () => {
      representativeDetails.fields.phoneNumber.value = '0800109756';
      expect(representativeDetails.CYAPhoneNumber).to.equal(representativeDetails.fields.phoneNumber.value);
    });
  });

  describe('get CYAEmailAddress()', () => {
    it('should return Not Provided if there is no email value', () => {
      expect(representativeDetails.CYAEmailAddress).to.equal(userAnswer.NOT_PROVIDED);
    });

    it('should return the email address if an emailaddress value has been set', () => {
      representativeDetails.fields.emailAddress.value = 'myemailaddress@sscs.com';
      expect(representativeDetails.CYAEmailAddress).to.equal(representativeDetails.fields.emailAddress.value);
    });
  });

  describe('get form()', () => {
    let fields = null;
    let field = null;

    beforeEach(() => {
      fields = representativeDetails.form.fields;
    });

    it('should contain dynamic fields', () => {
      if (isPostCodeLookupEnabled) {
        const req = { method: 'GET', body: {}, session: {}, query: {} };
        const next = sinon.spy();
        const redirect = sinon.spy();
        const res = { redirect };
        representativeDetails.req = req;
        representativeDetails.handler(req, res, next);
        fields = representativeDetails.form.fields;
        expect(Object.keys(fields).length).to.equal(4);
        expect(fields).to.have.all.keys(
          'name',
          'emailAddress',
          'phoneNumber',
          'postcodeLookup'
        );
      } else {
        expect(Object.keys(fields).length).to.equal(8);
        expect(fields).to.have.all.keys(
          'name',
          'addressLine1',
          'addressLine2',
          'townCity',
          'county',
          'postCode',
          'emailAddress',
          'phoneNumber'
        );
      }
    });

    describe('name field', () => {
      beforeEach(() => {
        field = fields.name;
      });

      it('has constructor name FieldDescriptor', () => {
        expect(field.constructor.name).to.eq('FieldDescriptor');
      });

      it('contains validation', () => {
        expect(field.validations).to.not.be.empty;
      });
    });

    describe('addressLine1 field', () => {
      if (!isPostCodeLookupEnabled) {
        beforeEach(() => {
          field = fields.addressLine1;
        });

        it('has constructor name FieldDescriptor', () => {
          expect(field.constructor.name).to.eq('FieldDescriptor');
        });

        it('contains validation', () => {
          expect(field.validations.length).to.eq(2);
        });
      }
    });

    describe('addressLine2 field', () => {
      if (!isPostCodeLookupEnabled) {
        beforeEach(() => {
          field = fields.addressLine2;
        });

        it('has constructor name FieldDescriptor', () => {
          expect(field.constructor.name).to.eq('FieldDescriptor');
        });

        it('contains validation', () => {
          expect(field.validations.length).to.eq(1);
        });
      }
    });

    describe('townCity field', () => {
      if (!isPostCodeLookupEnabled) {
        beforeEach(() => {
          field = fields.townCity;
        });

        it('has constructor name FieldDescriptor', () => {
          expect(field.constructor.name).to.eq('FieldDescriptor');
        });

        it('contains validation', () => {
          expect(field.validations.length).to.eq(2);
        });
      }
    });

    describe('county field', () => {
      if (!isPostCodeLookupEnabled) {
        beforeEach(() => {
          field = fields.county;
        });

        it('has constructor name FieldDescriptor', () => {
          expect(field.constructor.name).to.eq('FieldDescriptor');
        });

        it('contains validation', () => {
          expect(field.validations.length).to.eq(2);
        });
      }
    });

    describe('postCode field', () => {
      if (!isPostCodeLookupEnabled) {
        beforeEach(() => {
          field = fields.postCode;
        });

        it('has constructor name FieldDescriptor', () => {
          expect(field.constructor.name).to.eq('FieldDescriptor');
        });

        it('contains validation', () => {
          expect(field.validations).to.not.be.empty;
        });
      }
    });

    describe('phoneNumber field', () => {
      beforeEach(() => {
        field = fields.phoneNumber;
      });

      it('has constructor name FieldDescriptor', () => {
        expect(field.constructor.name).to.eq('FieldDescriptor');
      });

      it('contains validation', () => {
        expect(field.validations).to.not.be.empty;
      });
    });

    describe('emailAddress field', () => {
      beforeEach(() => {
        field = fields.emailAddress;
      });

      it('has constructor name FieldDescriptor', () => {
        expect(field.constructor.name).to.eq('FieldDescriptor');
      });

      it('contains validation', () => {
        expect(field.validations).to.not.be.empty;
      });
    });
  });

  describe('answers()', () => {
    let answers = null;

    before(() => {
      answers = representativeDetails.answers()[0];
    });

    it('should return expected section', () => {
      expect(answers.section).to.equal('representative');
    });

    it('should return expected template', () => {
      expect(answers.template).to.equal('answer.html');
    });
  });

  describe('values()', () => {
    [
      'MR,HARRY,POTTER',
      'mr,harry,potter',
      'mR,haRRy,pOttEr',
      'Mr,harry John,pOttEr'
    ].forEach(item => {
      it(`should contain a value object with full name # ${item}`, () => {
        representativeDetails.fields.name.title.value = item.split(',')[0];
        representativeDetails.fields.name.first.value = item.split(',')[1];
        representativeDetails.fields.name.last.value = item.split(',')[2];
        representativeDetails.fields.name.organisation.value = 'Organisation';
        representativeDetails.fields.addressLine1.value = 'First line of my address';
        representativeDetails.fields.addressLine2.value = 'Second line of my address';
        representativeDetails.fields.townCity.value = 'Town or City';
        representativeDetails.fields.county.value = 'County';
        representativeDetails.fields.postCode.value = 'Postcode';
        representativeDetails.fields.phoneNumber.value = '0800109756';
        representativeDetails.fields.emailAddress.value = 'myemailaddress@sscs.com';
        representativeDetails.fields.postcodeLookup.value = 'n29ed';
        representativeDetails.fields.postcodeAddress.value = '200000';
        const values = representativeDetails.values();
        expect(values).to.eql({
          representative: {
            title: 'Mr',
            firstName: 'Harry',
            lastName: 'Potter',
            organisation: 'Organisation',
            contactDetails: {
              addressLine1: 'First line of my address',
              addressLine2: 'Second line of my address',
              townCity: 'Town or City',
              county: 'County',
              postCode: 'Postcode',
              postcodeLookup: 'n29ed',
              postcodeAddress: '200000',
              phoneNumber: '0800109756',
              emailAddress: 'myemailaddress@sscs.com'
            }
          }
        });
      });
    });

    it('should contain empty object', () => {
      representativeDetails.fields.postcodeLookup = undefined;
      representativeDetails.fields.postcodeAddress = undefined;
      const values = representativeDetails.values();
      expect(values).to.eql({
        representative: {
          title: '',
          firstName: '',
          lastName: '',
          organisation: '',
          contactDetails: {
            addressLine1: '',
            addressLine2: '',
            townCity: '',
            county: '',
            postCode: '',
            postcodeLookup: '',
            postcodeAddress: '',
            phoneNumber: '',
            emailAddress: ''
          }
        }
      });
    });

    it('removes whitespace from before and after the postcode string', () => {
      representativeDetails.fields.postCode.value = ' Post code ';
      const postcode = representativeDetails.values().representative.contactDetails.postCode;
      expect(postcode).to.not.equal(' Post code ');
      expect(postcode).to.equal('Post code');
    });

    it('removes whitespace from before and after the phone number string', () => {
      representativeDetails.fields.phoneNumber.value = ' 0800109756 ';
      const phoneNumber = representativeDetails.values().representative.contactDetails.phoneNumber;
      expect(phoneNumber).to.not.equal(' 0800109756 ');
      expect(phoneNumber).to.equal('0800109756');
    });
  });

  describe('next()', () => {
    it('returns the next step path /reason-for-appealing', () => {
      expect(representativeDetails.next()).to.eql({ nextStep: paths.reasonsForAppealing.reasonForAppealing });
    });
  });
});
