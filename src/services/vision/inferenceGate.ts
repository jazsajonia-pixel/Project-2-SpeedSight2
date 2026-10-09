export class InferenceGate {
  private active = false;

  public tryEnter(): boolean {
    if (this.active) return false;
    this.active = true;
    return true;
  }

  public leave(): void {
    this.active = false;
  }

  public isActive(): boolean {
    return this.active;
  }
}
