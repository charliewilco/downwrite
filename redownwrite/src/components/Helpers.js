// @flow
import React, { Component } from 'react'
import { Block, Flex } from 'glamor/jsxstyle'
import { Toggle } from './'
import Media from 'react-media'

export const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className="Chevron"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}>
    <path
      d={
        open
          ? 'M1.0606601717798212 11 L8 4.060660171779821 L14.939339828220179 11'
          : 'M1.0606601717798212 5 L8 11.939339828220179 L14.939339828220179 5'
      }
    />
  </svg>
)

export default class extends Component<{ children?: Node, render: Function }> {
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
                  {!match &&
                    children && (
                      <button style={{ outline: 0, border: 0 }} onClick={toggle}>
                        <Chevron open={open} />
                      </button>
                    )}{' '}
                  {render && render()}
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
