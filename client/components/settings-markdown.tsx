import * as React from "react";
import Input from "./input";

export default class MarkdownSettings extends React.Component {
  state = {
    fileExtension: ".md"
  };

  updateExtension = ({ target }) => this.setState({ fileExtension: target.value });

  render() {
    const { fileExtension } = this.state;
    return <Input onChange={this.updateExtension} value={fileExtension} />;
  }
}
