import { Action } from '@ngrx/store';
import { Position } from '../canvas.component';
import { createAction, props } from '@ngrx/store';

export const CanvasClicked = createAction(
  '[CANVAS] Canvas Clicked',
  props<{ position: Position; clickedAreaIndex: number }>()
);
