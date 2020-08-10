export interface ICredentials {
  id: string;
  user: string;
}

export interface IRequestAuth {
  credentials: ICredentials;
}

export interface IRequest {
  auth: IRequestAuth;
}

export interface ILoginRequest {
  auth: IRequestAuth;
  payload: {
    user: string;
    password: string;
  };
}

export interface IPasswordResetRequest {
  auth: IRequestAuth;
  payload: {
    oldPassword: string;
    newPassword: string;
  };
}

export interface IRegisterRequest {
  auth: IRequestAuth;
  payload: {
    username?: string;
    email?: string;
    password: string;
  };
}
