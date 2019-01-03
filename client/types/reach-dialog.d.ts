declare module "@reach/dialog" {
  interface IGenericProps {
    children: string | JSX.Element;
  }
  class DialogOverlay extends React.Component<any, {}> {}
  class DialogContent extends React.Component<any, {}> {}
}
