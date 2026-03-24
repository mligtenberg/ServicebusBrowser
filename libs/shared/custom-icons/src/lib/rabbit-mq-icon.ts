import { CustomIconDefinition } from './icon-definition';

const width = 512;
const height = 512;
const svgPathData =
  'M 394.2 173.7 H 266.5 a 15.9 15.9 90 0 1 -16 -16 V 30 A 15.9 15.9 90 0 0 234.5 14.1 H 186.7 A 15.9 15.9 90 0 0 170.7 30 v 127.7 a 15.9 15.9 90 0 1 -16 16 h -47.8 a 15.9 15.9 90 0 1 -16 -16 V 30 A 15.9 15.9 90 0 0 74.9 14 H 27 A 15.9 15.9 90 0 0 11.1 30 v 367.2 a 15.9 15.9 90 0 0 16 16 h 367.1 a 15.9 15.9 90 0 0 16 -16 V 190 a 15.9 15.9 90 0 0 -16 -16.3 z M 330 309.3 a 23.9 23.9 90 0 1 -23.9 24 h -32 a 23.9 23.9 90 0 1 -23.9 -24 v -31.9 a 23.9 23.9 90 0 1 23.9 -24 h 32 a 23.9 23.9 90 0 1 23.9 24 z';

// Replace this with the data from your SVG
export const sbbRabbitMq: CustomIconDefinition = {
  prefix: 'sbb',
  iconName: 'rabbitMq',
  icon: [
    width, // width
    height, // height
    [], // aliases
    'e001', // unicode-ish unique value, can be any string
    svgPathData,
  ],
};
