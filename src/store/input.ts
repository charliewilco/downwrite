export enum InputAction {
  BLUR = "BLUR",
  FOCUS = "FOCUS"
}

export interface IInputState {
  focused: boolean;
}

export interface IInputAction {
  type: InputAction;
}

export function inputReducer(_: IInputState, action: IInputAction): IInputState {
  switch (action.type) {
    case InputAction.BLUR:
      return { focused: false };
    case InputAction.FOCUS:
      return { focused: false };
    default:
      throw new Error("Must specify action type");
  }
}
