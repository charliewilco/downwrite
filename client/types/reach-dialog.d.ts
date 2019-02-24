declare module "@reach/dialog" {
  export interface DialogProps {
    isOpen?: boolean;
    onDismiss?: () => void;
    children: React.ReactNode | any;
    className?: string;
  }

  export interface DialogOverlayProps extends DialogProps {
    initialFocusRef?: React.RefObject<HTMLElement>;
  }

  export interface DialogContentProps {
    children: React.ReactNode | any;
  }

  export const Dialog: React.FC<
    DialogProps &
      React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  >;
  export const DialogOverlay: React.FC<DialogOverlayProps>;
  export const DialogContent: React.FC<
    DialogContentProps &
      React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  >;
}
