import * as React from "react";
import styled from "styled-components";
import Check from "./checkbox";

const Container = styled.div`
  margin-right: 16px;
`;

const LabelFlex = styled.label`
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  flex: 1;
  margin-left: 8px;
  display: inline-block;
  vertical-align: middle;
  line-height: 1.2;
`;

interface ICheckboxToggle {
  value: boolean;
  name?: string;
  label: (value: boolean) => string;
  onChange: (e: React.ChangeEvent) => void;
}

export const ToggleBox: React.SFC<ICheckboxToggle> = ({
  value,
  label,
  name,
  onChange
}) => {
  const text = label(value);
  return (
    <Container>
      <LabelFlex>
        <Check name={name} checked={value} onChange={onChange} />
        <Label>{text}</Label>
      </LabelFlex>
    </Container>
  );
};
