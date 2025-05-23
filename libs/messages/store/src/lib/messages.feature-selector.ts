import { createFeatureSelector } from '@ngrx/store';
import { featureKey, MessagesState } from './messages.store';

export const featureSelector = createFeatureSelector<MessagesState>(featureKey);
