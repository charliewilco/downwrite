import * as React from "react";
import Link from "next/link";
import Checkbox from "./checkbox";
import * as DefaultStyles from "../utils/defaultStyles";
import { NightModeContext } from "./night-mode";

interface ILegalProps {
  name: string;
  checked: boolean;
  onChange: (x: React.ChangeEvent<HTMLInputElement>) => void;
}

const LegalLink = () => (
  <Link href="/legal">
    <a>legal stuff</a>
  </Link>
);

const LegalBoilerplate: React.FC<ILegalProps> = props => {
  const theme = React.useContext(NightModeContext);
  return (
    <label htmlFor={props.name}>
      <Checkbox
        className="LegalCheck"
        name={props.name}
        id={props.name}
        checked={props.checked}
        onChange={props.onChange}
      />
      <small>
        I'm agreeing to abide in all the <LegalLink />.
      </small>
      <style jsx>{`
        small {
          flex: 1;
          line-height: 1.2;
        }

        label {
          display: flex;
          align-items: center;
          margin: 16px;
          font-weight: 700;
          background: ${theme.night ? "white" : "#d8eaf1"};
          padding: 8px;
          color: ${DefaultStyles.colors.text};
        }

        .LegalCheck {
          margin-right: 16px;
          display: block;
          max-width: 20px;
        }
      `}</style>
    </label>
  );
};

export default LegalBoilerplate;
