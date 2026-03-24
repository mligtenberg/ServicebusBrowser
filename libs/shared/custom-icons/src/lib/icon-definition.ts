import {
  IconPathData,
} from '@fortawesome/fontawesome-common-types';

export interface CustomIconLookup {
  prefix: string;
  // IconName is defined in the code that will be generated at build time and bundled with this file.
  iconName: string;
}

export interface CustomIconDefinition extends CustomIconLookup {
  icon: [
    number, // width
    number, // height
    string[], // ligatures
    string, // unicode
    IconPathData, // svgPathData
  ];
}
