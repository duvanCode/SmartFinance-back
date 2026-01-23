import { BaseEntity } from '@shared/domain/base.entity';
import { Email } from '../value-objects/email.vo';
import { GoogleId } from '../value-objects/google-id.vo';

export interface UserProps {
  id: string;
  email: Email;
  name: string;
  googleId: GoogleId;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _email: Email;
  private _name: string;
  private _googleId: GoogleId;
  private _avatar?: string;

  constructor(props: UserProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._email = props.email;
    this._name = props.name;
    this._googleId = props.googleId;
    this._avatar = props.avatar;
  }

  // Getters
  get email(): Email {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get googleId(): GoogleId {
    return this._googleId;
  }

  get avatar(): string | undefined {
    return this._avatar;
  }

  // Business methods
  updateProfile(name: string, avatar?: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    if (name.length > 100) {
      throw new Error('Name is too long');
    }

    this._name = name.trim();
    this._avatar = avatar;
    this.updateTimestamp();
  }

  // Factory method
  static create(
    email: string,
    name: string,
    googleId: string,
    avatar?: string,
  ): User {
    return new User({
      id: crypto.randomUUID(),
      email: new Email(email),
      name,
      googleId: new GoogleId(googleId),
      avatar,
    });
  }

  // Convert to plain object for persistence
  toPersistence() {
    return {
      id: this.id,
      email: this._email.getValue(),
      name: this._name,
      googleId: this._googleId.getValue(),
      avatar: this._avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Reconstruct from persistence
  static fromPersistence(data: {
    id: string;
    email: string;
    name: string;
    googleId: string;
    avatar?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: data.id,
      email: new Email(data.email),
      name: data.name,
      googleId: new GoogleId(data.googleId),
      avatar: data.avatar ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
