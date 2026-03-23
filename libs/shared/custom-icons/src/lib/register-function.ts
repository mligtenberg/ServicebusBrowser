import { library } from '@fortawesome/fontawesome-svg-core';
import { CustomIconDefinition } from './icon-definition';

export function registerIcon(icon: CustomIconDefinition) {
  library.add(icon as any);
}
