import { UniqueEntityID } from "./unique-entity-id";

const isEntity = <T>(v: unknown): v is Entity<T> => {
  return v instanceof Entity;
};

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected props: T;

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id || new UniqueEntityID();
    this.props = props;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity<T>(object)) {
      return false;
    }

    return this._id.equals(object._id);
  }

  get id(): UniqueEntityID {
    return this._id;
  }
}
