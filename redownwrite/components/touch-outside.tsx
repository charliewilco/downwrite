import * as React from 'react';
import { findDOMNode } from 'react-dom';

const addListeners = (el: Document, s: string, fn: () => void) =>
  s.split(' ').forEach(e => el.addEventListener(e, fn, false));

const rmListeners = (el: Document, s: string, fn: () => void) =>
  s.split(' ').forEach(e => el.removeEventListener(e, fn, false));

// TODO: Should blur child
interface ITouchOutsideProps {
  onChange: () => void;
  children: React.ReactNode;
}

export default class TouchOutside extends React.Component<ITouchOutsideProps> {
  static displayName = 'TouchOutside';

  componentDidMount() {
    if (document) {
      addListeners(document, 'touchstart click', this.outsideHandleClick);
    }
  }

  componentWillUnmount() {
    if (document) {
      rmListeners(document, 'touchstart click', this.outsideHandleClick);
    }
  }

  outsideHandleClick = ({ target }: React.SyntheticEvent<any>) => {
    const node = findDOMNode(this);

    if (node instanceof HTMLElement) {
      if (!node.contains(target)) {
        return this.props.onChange();
      }
    }
  };

  render() {
    return <>{this.props.children}</>;
  }
}
