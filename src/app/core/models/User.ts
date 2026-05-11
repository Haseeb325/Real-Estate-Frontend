import { UsersResponseDto } from './user.dto';

export class UserModel {
  constructor(
    private _id: string,
    private _email: string,
    private _username: string,
    private _full_name: string,
    private _role: string,
    private _is_email_verified: boolean,
    private _status: string,
    private _is_active: boolean,
  ) {}

  get id() {
    return this._id;
  }
  get email() {
    return this._email;
  }
  get username() {
    return this._username;
  }
  get fullName() {
    return this._full_name;
  }
  get role() {
    return this._role;
  }
  get isEmailVerified() {
    return this._is_email_verified;
  }
  get status() {
    return this._status;
  }
  get isActive() {
    return this._is_active;
  }

  static fromJson(dto: UsersResponseDto): UserModel {
    return new UserModel(
      dto.id,
      dto.email,
      dto.username,
      dto.full_name,
      dto.role,
      dto.is_email_verified,
      dto.status,
      dto.is_active,
    );
  }

  toJson(): UsersResponseDto {
    return {
      id: this._id,
      email: this._email,
      username: this._username,
      full_name: this._full_name,
      role: this._role,
      is_email_verified: this._is_email_verified,
      status: this._status,
      is_active: this._is_active,
    };
  }
}
