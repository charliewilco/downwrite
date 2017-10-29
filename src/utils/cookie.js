// @flow
import { Cookies } from 'react-cookie'

const oatmeal: typeof Cookies = new Cookies()

export const TOKEN: string = oatmeal.get('token')
export const USER_ID: string = oatmeal.get('id')
