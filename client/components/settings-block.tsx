import * as React from "react";
import classNames from "../utils/classnames";

interface ISettingsFormActionsProps {
  split?: boolean;
  children: React.ReactNode;
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

interface ISettingsBlockProps {
  title: string;
  description?: string;
  children: React.ReactNode;
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
