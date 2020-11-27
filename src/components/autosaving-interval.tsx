import { useAutosaving } from "../hooks";
import { Fragment } from "react";

interface IAutosavingProps {
  onUpdate: (x?: any) => void;
  delay?: number;
  duration?: number;
  title?: string;
}

export default function AutosavingInterval(props: IAutosavingProps): JSX.Element {
  const message = `Autosaving “${props.title ?? "Your Entry"}”`;
  useAutosaving(props.duration, props.onUpdate, message);
  return <Fragment />;
}
