import fs from 'fs';
import path from 'path';
import dcmjs from 'dcmjs';
import { InstanceMetadata } from '../src/types';

interface DatasetReadResults {
  instanceMetadata: InstanceMetadata[];
  instanceRescale: InstanceRescaleData[];
  pixelDataTypedArray: Int16Array | Uint16Array | Int8Array | Uint8Array;
  frameLength: number;
  numFrames: number;
}

interface InstanceRescaleData {
  RescaleSlope: number;
  RescaleIntercept: number;
}

export default function readDICOMFolder(folder: string): DatasetReadResults {
  let files = fs.readdirSync(folder);
  files = files.filter(file => file !== '.DS_Store');

  const datasets = files.map(file => {
    const fullFilePath = path.resolve(path.join(folder, file));
    const buffer = fs.readFileSync(fullFilePath);
    const dicomData = dcmjs.data.DicomMessage.readFile(buffer.buffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dicomData.dict
    );
    dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(
      dicomData.meta
    );

    return dataset;
  });

  datasets.sort((a, b) => {
    if (a.SliceLocation && b.SliceLocation) {
      return a.SliceLocation - b.SliceLocation;
    } else if (a.ImageIndex && b.ImageIndex) {
      return a.ImageIndex - b.ImageIndex;
    } else {
      // TODO: check if we are sorting the same as normalizeToDataset is
      console.log(a);
      throw new Error('SliceLocation and ImageIndex are not present');
    }
  });

  const frameLength = datasets[0].Rows * datasets[0].Columns;
  const numFrames = datasets.length;

  // TODO: probably needs to be another type in some cases?
  let TypedArray:
    | Int16ArrayConstructor
    | Uint16ArrayConstructor
    | Int8ArrayConstructor
    | Uint8ArrayConstructor;
  if (datasets[0].BitsAllocated === 16) {
    if (datasets[0].PixelRepresentation === 1) {
      TypedArray = Int16Array;
    } else {
      TypedArray = Uint16Array;
    }
  } else if (datasets[0].BitsAllocated === 8) {
    if (datasets[0].PixelRepresentation === 1) {
      TypedArray = Int8Array;
    } else {
      TypedArray = Uint8Array;
    }
  } else {
    throw new Error(
      `Cannot create typed array: ${datasets[0].BitsAllocated} ${datasets[0].PixelRepresentation}`
    );
  }

  const pixelDataTypedArray = new TypedArray(numFrames * frameLength);

  const instanceMetadata = datasets.map(
    (dataset: any, index: number): InstanceMetadata => {
      pixelDataTypedArray.set(
        new TypedArray(dataset.PixelData),
        index * frameLength
      );

      return {
        SeriesDate: dataset.SeriesDate,
        SeriesTime: dataset.SeriesTime,
        PatientSex: dataset.PatientSex,
        PatientWeight: dataset.PatientWeight,
        AcquisitionDate: dataset.AcquisitionDate,
        AcquisitionTime: dataset.AcquisitionTime,
        FrameReferenceTime: dataset.FrameReferenceTime,
        DecayCorrection: dataset.DecayCorrection,
        Units: dataset.Units,
        RadionuclideTotalDose:
          dataset.RadiopharmaceuticalInformationSequence.RadionuclideTotalDose,
        RadionuclideHalfLife:
          dataset.RadiopharmaceuticalInformationSequence.RadionuclideHalfLife,
        RadiopharmaceuticalStartTime:
          dataset.RadiopharmaceuticalInformationSequence
            .RadiopharmaceuticalStartTime, // from old version of standard
        RadiopharmaceuticalStartDateTime:
          dataset.RadiopharmaceuticalInformationSequence
            .RadiopharmaceuticalStartDateTime,
        CorrectedImage: dataset.CorrectedImage,
        ActualFrameDuration: dataset.ActualFrameDuration,
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: dataset['70531000'],
          ActivityConcentrationScaleFactor: dataset['70531009'],
        },
        GEPrivatePostInjectionDateTime: dataset['0009100d'],
      };
    }
  );

  const instanceRescale = datasets.map(
    (dataset: any): InstanceRescaleData => {
      return {
        RescaleSlope: dataset.RescaleSlope,
        RescaleIntercept: dataset.RescaleIntercept,
      };
    }
  );

  return {
    instanceMetadata,
    instanceRescale,
    pixelDataTypedArray,
    frameLength,
    numFrames,
  };
}
