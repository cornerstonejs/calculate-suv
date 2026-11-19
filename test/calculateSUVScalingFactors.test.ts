import { calculateSUVScalingFactors } from '../src';
import { calculateSUVbsaScalingFactor } from '../src/calculateSUVbsaScalingFactor';
import {
  calculateSUVlbmJanmahasatianScalingFactor,
  calculateSUVlbmScalingFactor,
} from '../src/calculateSUVlbmScalingFactor';
import { InstanceMetadata } from '../src/types';

let input: InstanceMetadata[];
let inputPhilips: InstanceMetadata[];
let multiInput: InstanceMetadata[];
let inputlbmbsaFactor: InstanceMetadata[];

describe('calculateSUVScalingFactors', () => {
  beforeEach(() => {
    input = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0.000551,
          ActivityConcentrationScaleFactor: 1.602563,
        },
      },
    ];
    inputlbmbsaFactor = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 75,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PatientSex: 'M',
        PatientSize: 1.85,
      },
    ];
    inputPhilips = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'CNTS',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0,
          ActivityConcentrationScaleFactor: 1.602563,
        },
      },
    ];
  });

  it('returns suvbw 1.0 if Units are GML', () => {
    input[0].Units = 'GML';

    expect(calculateSUVScalingFactors(input)).toEqual([{ suvbw: 1.0 }]);
  });

  it('calculates suvbw if Units are CNTS (PhilipsPETPrivateGroup SUVScaleFactor available)', () => {
    input[0].Units = 'CNTS';

    expect(calculateSUVScalingFactors(input)).toEqual([{ suvbw: 0.000551 }]);
  });

  it('calculates suvbw if Units are CNTS (PhilipsPETPrivateGroup SUVScaleFactor not available)', () => {
    expect(calculateSUVScalingFactors(inputPhilips)).toEqual([
      { suvbw: 1602.5629999999999 },
    ]);
  });

  describe('suvbsa, suvlbm and suvlbmJanma for each of the Units', () => {
    // 75 kg, 1.80 m, male, scanned one hour after an 18F injection
    const instance = (fields: Partial<InstanceMetadata>): InstanceMetadata => ({
      CorrectedImage: ['ATTN', 'DECY'],
      Units: 'BQML',
      RadionuclideHalfLife: 6586.2,
      RadiopharmaceuticalStartDateTime: '20201023085417',
      RadionuclideTotalDose: 370e6,
      DecayCorrection: 'START',
      PatientWeight: 75,
      PatientSize: 1.8,
      PatientSex: 'M',
      SeriesTime: '095417',
      SeriesDate: '20201023',
      AcquisitionTime: '095417',
      AcquisitionDate: '20201023',
      ...fields,
    });
    // For each instance, each factor over suvbw, which is the BSA or LBM over
    // the weight whatever the units of the pixel values
    const overSuvbw = (...fields: Partial<InstanceMetadata>[]): number[][] =>
      calculateSUVScalingFactors(fields.map(instance)).map(factors =>
        [factors.suvbsa!, factors.suvlbm!, factors.suvlbmJanma!].map(
          factor => factor / factors.suvbw
        )
      );
    const body = { PatientWeight: 75, PatientSize: 1.8, PatientSex: 'M' };
    const expected = [
      calculateSUVbsaScalingFactor(body),
      calculateSUVlbmScalingFactor(body),
      calculateSUVlbmJanmahasatianScalingFactor(body),
    ].map(factor => factor / 75000);

    const expectRatios = (instances: number[][]) => {
      instances.forEach(ratios => {
        expect(ratios).toHaveLength(expected.length);
        ratios.forEach((ratio, index) => {
          expect(ratio).toBeCloseTo(expected[index], 12);
        });
      });
    };

    it('are the BSA and LBM over the weight times suvbw if Units are BQML', () => {
      expectRatios(overSuvbw({}));
    });

    it('are the BSA and LBM over the weight times suvbw if Units are GML', () => {
      expectRatios(overSuvbw({ Units: 'GML' }));
    });

    it('are the BSA and LBM over the weight times suvbw if Units are CNTS with SUVScaleFactor', () => {
      expectRatios(
        overSuvbw({
          Units: 'CNTS',
          PhilipsPETPrivateGroup: {
            SUVScaleFactor: 0.000551,
            ActivityConcentrationScaleFactor: undefined,
          },
        })
      );
    });

    it('are the BSA and LBM over the weight times suvbw if Units are CNTS with ActivityConcentrationScaleFactor', () => {
      expectRatios(
        overSuvbw({
          Units: 'CNTS',
          PhilipsPETPrivateGroup: {
            SUVScaleFactor: undefined,
            ActivityConcentrationScaleFactor: 1.602563,
          },
        })
      );
    });

    it('are those of the SUVScaleFactor if Units are CNTS with both private factors', () => {
      const fields = {
        Units: 'CNTS',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0.000551,
          ActivityConcentrationScaleFactor: 1.602563,
        },
      };

      expect(calculateSUVScalingFactors([instance(fields)])[0].suvbw).toEqual(
        0.000551
      );
      expectRatios(overSuvbw(fields));
    });

    it('are those of each instance if the private factors differ between instances', () => {
      const withFactors = (
        name: 'SUVScaleFactor' | 'ActivityConcentrationScaleFactor',
        values: number[]
      ): Partial<InstanceMetadata>[] =>
        values.map(value => ({
          Units: 'CNTS',
          PhilipsPETPrivateGroup: {
            SUVScaleFactor: undefined,
            ActivityConcentrationScaleFactor: undefined,
            [name]: value,
          },
        }));
      const suvScaleFactors = withFactors('SUVScaleFactor', [0.000551, 0.0003]);
      const activityFactors = withFactors('ActivityConcentrationScaleFactor', [
        1.602563,
        0.8,
      ]);

      expect(
        calculateSUVScalingFactors(suvScaleFactors.map(instance)).map(
          factors => factors.suvbw
        )
      ).toEqual([0.000551, 0.0003]);
      expectRatios(overSuvbw(...suvScaleFactors));

      const [first, second] = calculateSUVScalingFactors(
        activityFactors.map(instance)
      );
      expect(second.suvbw / first.suvbw).toBeCloseTo(0.8 / 1.602563, 12);
      expectRatios(overSuvbw(...activityFactors));
    });
  });

  it('calculates suvbsa, suvlbm and suvFactor if weight, size and sex known', () => {
    expect(calculateSUVScalingFactors(inputlbmbsaFactor)).toEqual([
      {
        suvbw: 750,
        suvbsa: 198.13758427117767,
        suvlbm: 627.7757487216948,
        suvlbmJanma: 609.1533588651974,
      },
    ]);
  });
});

describe('calculateSUVScalingFactor Error Handling', () => {
  beforeEach(() => {
    input = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
      },
    ];
    multiInput = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
      },
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 11,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
      },
    ];
    inputPhilips = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'CNTS',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0,
          ActivityConcentrationScaleFactor: 0,
        },
      },
    ];
  });

  it("throws an Error if CorrectedImage value does not contain 'ATTN' and 'DECY'", () => {
    input[0].CorrectedImage = ['Blah'];

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError(
      `CorrectedImage must contain "ATTN" and "DECY": ${input[0].CorrectedImage}`
    );
  });

  it('throws an Error if Units is not CNTS, BQML, or GML', () => {
    input[0].Units = 'Blah';

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError(`Units has an invalid value: ${input[0].Units}`);
  });

  it('throws an Error if Decay time is negative', () => {
    input[0].RadiopharmaceuticalStartDateTime = '20201023115417';

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError('Decay time cannot be less than zero');
  });

  it('throws an Error if the PatientWeight is zero', () => {
    input[0].PatientWeight = 0;

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError(
      `PatientWeight value is missing. It is not possible to calculate the SUV factors`
    );
  });

  it('throws an Error if series-level metadata are different', () => {
    expect(() => {
      calculateSUVScalingFactors(multiInput);
    }).toThrowError(
      'The set of instances does not appear to come from one Series. Every instance must have identical values for series-level metadata properties'
    );
  });

  it('throws an Error if Philips has no ValidSUVScaleFactor and ValidActivityConcentrationScaleFactor', () => {
    expect(() => {
      calculateSUVScalingFactors(inputPhilips);
    }).toThrowError(
      `Units are in CNTS, but PhilipsPETPrivateGroup has invalid values: ${JSON.stringify(
        inputPhilips[0].PhilipsPETPrivateGroup
      )}`
    );
  });
});
