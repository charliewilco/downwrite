import * as React from "react";
import classNames from "../utils/classnames";

interface ISettingsFormActionsProps extends React.PropsWithChildren<{}> {
  split?: boolean;
  className?: string;
}

export function SettingsFormActions(props: ISettingsFormActionsProps): JSX.Element {
  const className = classNames(
    "ActionsContainer",
    props.split && "ActionsContainer--split",
    props.className
  );
  return <div className={className}>{props.children}</div>;
}

interface ISettingsBlockProps extends React.PropsWithChildren<{}> {
  title: string;
  description?: string;
}

export default function SettingsBlock(props: ISettingsBlockProps): JSX.Element {
  return (
    <section className="Sheet SettingsBlock">
      <div className="SettingsBlockTitleContainer">
        <h4 className="SettingsBlockTitle">{props.title}</h4>
        {props.description && (
          <p className="SettingsBlockDescription">{props.description}</p>
        )}
      </div>
      <div className="SettingsBlockContents">{props.children}</div>
    </section>
  );
}
