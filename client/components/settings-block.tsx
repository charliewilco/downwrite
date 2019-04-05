import * as React from "react";

interface ISettingsFormActionsProps {
  split?: boolean;
  children: React.ReactNode;
}

export function SettingsFormActions(props: ISettingsFormActionsProps): JSX.Element {
  return (
    <div className="ActionsContainer">
      {props.children}
      <style jsx>
        {`
          .ActionsContainer {
            margin-top: 16px;
            display: flex;
            justify-content: ${props.split ? "space-between" : "flex-end"};
          }
        `}
      </style>
    </div>
  );
}

interface ISettingsBlockProps {
  title: string;
  description?: string;
}

const SettingsBlock: React.FC<ISettingsBlockProps> = props => (
  <section>
    <div className="title-container">
      <h4>{props.title}</h4>
      {props.description && <p>{props.description}</p>}
    </div>
    <div className="contents">{props.children}</div>
    <style jsx>{`
      section {
        color: var(--color);
        background: var(--background);
        display: flex;
        flex-wrap: wrap;
        padding: 16px;
        margin-bottom: 32px;
        box-shadow: var(--shadow);
      }
      h4 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .contents {
        padding: 8px 0 0 0;
        flex: 1 1 62.5%;
      }

      .title-container {
        flex: 1 1 192px;
        width: 100%;
        padding-right: 32px;
        margin-bottom: 32px;
      }

      .title-container p {
        opacity: 0.75;
        font-size: 11px;
        font-weight: 300;
        font-style: italic;
      }
    `}</style>
  </section>
);

export default SettingsBlock;
