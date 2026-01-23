export abstract class BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  protected _updatedAt: Date;

  constructor(props: { id: string; createdAt?: Date; updatedAt?: Date }) {
    this.id = props.id;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  equals(entity: BaseEntity): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id === entity.id;
  }
}
