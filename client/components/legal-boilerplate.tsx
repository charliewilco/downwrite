import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import Checkbox from "./checkbox";

interface ILegalProps {
  name: string;
  checked: boolean;
  onChange: (x: any) => void;
}

const LegalInfo = styled.small`
  flex: 1;
  line-height: 1.2;
`;

const LegalCheck = styled(Checkbox)`
  margin-right: 16px;
  display: block;
  max-width: 20px;
`;

const LegalContainer = styled.label`
  display: flex;
  align-items: center;
  margin: 16px;
  background: #d8eaf1;
  padding: 8px;
`;

const LegalLink = () => (
  <Link href="/legal">
    <a>legal stuff</a>
  </Link>
);

const LegalBoilerplate: React.FC<ILegalProps> = ({ name, checked, onChange }) => (
  <LegalContainer>
    <LegalCheck name={name} checked={checked} onChange={onChange} />
    <LegalInfo>
      I'm agreeing to abide in all the <LegalLink />.
    </LegalInfo>
  </LegalContainer>
);

export default LegalBoilerplate;
