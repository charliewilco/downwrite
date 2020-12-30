import Link from "next/link";
import Checkbox from "./checkbox";
import { Routes } from "../utils/routes";

interface ILegalProps {
  name: string;
  checked: boolean;
  onChange(x: React.ChangeEvent<HTMLInputElement>): void;
}

const LegalLink = () => (
  <Link href={Routes.LOGIN} passHref>
    <a>legal stuff</a>
  </Link>
);

export default function LegalBoilerplate(props: ILegalProps) {
  return (
    <label
      className="flex items-center font-bold p-2 dark:bg-onyx-900 my-4 dark:text-white light:shadow"
      htmlFor={props.name}>
      <Checkbox
        data-testid="LEGAL_CHECK"
        name={props.name}
        id={props.name}
        checked={props.checked}
        onChange={props.onChange}
      />
      <small className="ml-4 block leading-tight flex-1">
        I'm agreeing to abide in all the <LegalLink />.
      </small>
    </label>
  );
}
