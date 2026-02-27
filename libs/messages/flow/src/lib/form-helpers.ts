import { FieldTree } from '@angular/forms/signals';

export const formHelpers = {
  asStringValueTree: (
    value: FieldTree<unknown, string>,
  ): FieldTree<string, string> => {
    return value as FieldTree<string, string>;
  },
  asDateValueTree: (
    value: FieldTree<unknown, string>,
  ): FieldTree<Date, string> => {
    return value as FieldTree<Date, string>;
  },
  asNumberValueTree: (
    value: FieldTree<unknown, string>,
  ): FieldTree<number, string> => {
    return value as FieldTree<number, string>;
  },
  asBooleanValueTree: (
    value: FieldTree<unknown, string>,
  ): FieldTree<boolean, string> => {
    return value as FieldTree<boolean, string>;
  },
};
