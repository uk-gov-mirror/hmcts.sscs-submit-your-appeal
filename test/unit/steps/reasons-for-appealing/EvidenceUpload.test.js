const EvidenceUpload = require('steps/reasons-for-appealing/evidence-upload/EvidenceUpload.js');
const { expect } = require('test/util/chai');
const paths = require('paths');
/* eslint-disable init-declarations */

describe('The other methods of EvidenceUpload', () => {
  let instance;

  beforeEach(() => {
    instance = new EvidenceUpload({
      journey: {
        steps: {
          EvidenceUpload: paths.reasonsForAppealing.evidenceUpload,
          TheHearing: paths.hearing.theHearing
        }
      }
    });
    instance.fields = {
      uploadEv: {
        value: 'ugo'
      },
      link: {
        value: 'www.example.com'
      }
    };
  });

  describe('get path()', () => {
    it('returns the correct path', () => {
      expect(instance.path).to.equal('/evidence-upload');
    });
  });

  describe('middleware', () => {
    it('returns an array', () => {
      expect(instance.middleware).to.be.an('array');
    });
    it('prepend its upload middleware to the parent middleware', () => {
      expect(instance.middleware.length).to.be.greaterThan(1);
    });
  });

  describe('get field()', () => {
    let fields = null;

    before(() => {
      fields = instance.fields;
    });

    it('should contain 2 field', () => {
      expect(Object.keys(fields).length).to.equal(2);
      expect(fields).to.have.all.keys(['link', 'uploadEv']);
    });
  });
  describe('next', () => {
    it('the next step is /the-hearing', () => {
      expect(instance.next().step).to.equal(paths.hearing.theHearing);
    });
  });
});
/* eslint-enable init-declarations */
