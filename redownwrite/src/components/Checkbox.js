import React from 'react'
import styled from 'styled-components'

const base64Icon = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkx
JQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy
9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yM
DAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPgo8cGF0
aCBmaWxsPSd3aGl0ZScgZD0iTTkgMTYuMTdMNC44MyAxMmwtMS40MiAxLjQxTDkgMTkgMjEgN2w
tMS40MS0xLjQxeiAiPjwvcGF0aD48L3N2Zz4=`

const Inp = styled.input`
  display: inline-block;
  border-radius: 4px;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  appearance: none;
  border: ${props => (props.checked ? 1 : 0)}px;
  background: ${props =>
    props.checked ? `var(--color-1) url("${base64Icon}") no-repeat center center` : '#D0D0D0'};
`

const Checkbox = props => <Inp type="checkbox" {...props} />

Checkbox.displayName = 'UICheckbox'

export default Checkbox
