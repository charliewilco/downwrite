import Cookies from 'universal-cookie';

export default (req, query): string => {
  const ck = new Cookies();

  const token: string =
    (req ? req.universalCookies.cookies.DW_TOKEN : query.token) ||
    ck.get('DW_TOKEN');

  return token;
};
