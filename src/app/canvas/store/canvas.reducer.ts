import { Action, createReducer, on } from '@ngrx/store';
import { Position } from '../canvas.component';
import * as CanvasActions from './canvas.actions';

const initialState: State = {
  clickedPos: {
    x: 0,
    y: 0,
  },
  hoveredPixel: {
    x: 0,
    y: 0,
  },
  clickedAreaIndex: -1,
};

export interface State {
  clickedPos: Position;
  hoveredPixel: Position;
  clickedAreaIndex: number;
}

const reducer = createReducer(
  initialState,
  on(CanvasActions.CanvasClicked, (state, action) => {
    return {
      ...state,
      clickedPos: action.position,
      clickedAreaIndex: action.clickedAreaIndex,
    };
  })
);

export function canvasReducer(state: State = initialState, action: Action) {
  return reducer(state, action);
}
