// @flow
import Cookies from 'universal-cookie'
const oatmeal: typeof Cookies = new Cookies()

export const TOKEN: string = oatmeal.get('DW_TOKEN')
export const USER_ID: string = oatmeal.get('DW_USERID')

export const signOut: Function = () => {
	oatmeal.remove('DW_TOKEN')
	oatmeal.remove('DW_USERID')
}

export const signIn: Function = (token, id) => {
	oatmeal.set('DW_TOKEN', token)
	oatmeal.set('DW_USERID', id)
}

export default oatmeal

export const intialState = {
	token: TOKEN,
	user: USER_ID
}
