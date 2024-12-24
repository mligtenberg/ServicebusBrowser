import { createAction, props } from '@ngrx/store';
import { Namespace } from '@service-bus-browser/topology-contracts';

export const namespacesLoaded = createAction(
  '[Topology] Namespaces Loaded',
  props<{ namespaces: Namespace[] }>()
);
