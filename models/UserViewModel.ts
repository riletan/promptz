export class UserViewModel {
  private _userId: string;
  private _userName: string;

  constructor(userId: string, userName: string) {
    this._userId = userId;
    this._userName = userName;
  }

  public get userName(): string {
    return this._userName;
  }

  public get userId(): string {
    return this._userId;
  }
}
