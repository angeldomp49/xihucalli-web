export class Optional<T> {

  public constructor(private child: T) {
  }

  public static empty() {
    return new Optional(null);
  }

  public static of(child: any) {
    return new Optional(child);
  }

  public isEmpty(): boolean {
    return !this.child;
  }

  public isPresent(): boolean {
    return !!this.child;
  }

  public value(): T {
    return this.child;
  }

  public map<U>(mapper: (value: T) => U): U | null {
    if (!this.child) {
      return null;
    }
    return mapper(this.child);
  }

  public orElseThrow(errorSupplier: () => Error): T {
    if (!this.child) {
      throw errorSupplier();
    }
    return this.child;
  }

}
