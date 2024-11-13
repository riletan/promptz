export class UserViewModel {
  private _userId: string;
  private _userName: string;
  private _preferredUsername: string;
  private _guest: boolean;

  constructor(
    userId: string,
    userName: string,
    preferredUsername: string,
    guest: boolean = true,
  ) {
    this._userId = userId;
    this._userName = userName;
    this._preferredUsername = preferredUsername;
    this._guest = guest;
  }

  public get userName(): string {
    return this._userName;
  }

  public get userId(): string {
    return this._userId;
  }

  public get guest(): boolean {
    return this._guest;
  }

  public get preferredUsername(): string {
    return this._preferredUsername;
  }
}
