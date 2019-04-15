import * as React from "react";
import Link from "next/link";
import Checkbox from "./checkbox";

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

export default function LegalBoilerplate(props: ILegalProps) {
  return (
    <label className="LegalConfirm" htmlFor={props.name}>
      <Checkbox
        className="LegalCheck"
        name={props.name}
        id={props.name}
        checked={props.checked}
        onChange={props.onChange}
      />
      <small className="LegalDisclaimer">
        I'm agreeing to abide in all the <LegalLink />.
      </small>
    </label>
  );
}
