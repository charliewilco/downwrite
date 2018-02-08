import React, { Component } from 'react'
import { Block, Flex } from 'glamor/jsxstyle'
import { Toggle } from './'
import Media from 'react-media'

// Open Button Should be a Chevron

export default class extends Component {
  static displayName = 'HelperToolbar'
  render() {
    const { children, render } = this.props
    return (
      <Media query={{ minWidth: 950 }}>
        {match => (
          <Toggle defaultOpen={match}>
            {(open, toggle) => (
              <Block
                float={match ? 'right' : 'none'}
                marginRight={match && -208}
                width={match && 192}>
                <Flex
                  marginBottom={16}
                  justifyContent={children ? 'space-between' : 'flex-end'}
                  padding={!match && 8}>
                  {!match && children && <button onClick={toggle}>Open</button>} {render()}
                </Flex>
                {(match || open) && (
                  <Flex
                    marginBottom={16}
                    flexDirection="column"
                    justifyContent={!match && 'space-between'}
                    paddingLeft={!match && 8}
                    paddingRight={!match && 8}>
                    {children}
                  </Flex>
                )}
              </Block>
            )}
          </Toggle>
        )}
      </Media>
    )
  }
}
