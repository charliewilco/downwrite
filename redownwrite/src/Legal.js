import React from 'react'
import { Content } from './components'

let tldr = {
  terms: `
    You're accepting that any public entry containing liablous, profane or racist,
    queerphobic, xenophobic or sexist content has the potential to be revoked
    and set back to private at my descrition.
  `,
  privacy: `
    Any content, albeit your personal information or an entry, is private until you
    opt out of making the entry private. I do not have the intention of selling,
    repackaging for sale, any of your content.
  `
}

let legalInfo = `


  ## Terms of Service

  > **TLDR**: ${tldr.terms.trim()}


  ## Privacy Policy

  > **TLDR**: ${tldr.privacy.trim()}

`

export default () => <Content title="Legal Nonsense" content={legalInfo} />
