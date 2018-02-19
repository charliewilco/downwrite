// @flow

import * as React from 'react'
import { Link } from 'react-router-dom'
import { Flex, Block, InlineBlock } from 'glamor/jsxstyle'
import { LoginInput, Button, Check } from './components'
import { USER_ENDPOINT } from './utils/urls'

type RegisterType = {
  username: string,
  password: string,
  email: string,
  checked: boolean
}

type LoginProps = {
  signIn: Function
}

class Register extends React.Component<LoginProps, RegisterType> {
  state = {
    username: '',
    password: '',
    email: '',
    checked: false
  }

  onSubmit = async (evt: Event) => {
    evt.preventDefault()

    const { username, password, email } = this.state

    const response = await fetch(USER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, email })
    })

    const user: { userID: string, id_token: string, username: string } = await response.json()

    console.log(user)

    if (user.userID) {
      this.props.signIn(user.id_token !== undefined, user.id_token)
    }
  }

  render() {
    const { username, password, email, checked } = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <Block padding={16}>
          <LoginInput
            placeholder="Try for something unique"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={({ target }: SyntheticInputEvent<*>) =>
              this.setState({ username: target.value })
            }
          />

          <LoginInput
            placeholder="mail@email.com"
            label="Email"
            autoComplete="email"
            value={email}
            onChange={({ target }: SyntheticInputEvent<*>) =>
              this.setState({ email: target.value })
            }
          />

          <LoginInput
            placeholder="*********"
            label="Password"
            value={password}
            autoComplete="current-password"
            type="password"
            onChange={({ target }: SyntheticInputEvent<*>) =>
              this.setState({ password: target.value })
            }
          />
        </Block>
        <Flex margin={16} backgroundColor="#d8eaf1" padding={8}>
          <label>
            <Check
              checked={checked}
              value={checked}
              onChange={() => this.setState(({ checked }) => ({ checked: !checked }))}
            />
            <small
              style={{
                marginLeft: 16,
                display: 'inline-block',
                verticalAlign: 'middle',
                lineHeight: 1.1
              }}>
              I'm agreeing to abide in all the <Link to="/legal">legal stuff</Link>.
            </small>
          </label>
        </Flex>

        <Block padding={16} textAlign="right">
          <InlineBlock>
            <Button disabled={!checked} onClick={this.onSubmit}>
              Register
            </Button>
          </InlineBlock>
        </Block>
      </form>
    )
  }
}

export default Register
