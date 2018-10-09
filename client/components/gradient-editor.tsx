import * as React from "react";
import Avatar from "./avatar";

interface IGradientEditorProps {
  initialColors: any;
}

interface IGradientEditorState {
  colors: string[];
}

export default class GradientEditor extends React.Component<
  IGradientEditorProps,
  IGradientEditorState
> {
  state = {
    colors: this.props.initialColors
  };

  render() {
    const { colors } = this.state;
    return <Avatar colors={colors} />;
  }
}
