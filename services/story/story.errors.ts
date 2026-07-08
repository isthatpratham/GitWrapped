// ---------------------------------------------------------------------------
// Story Engine — Errors
// ---------------------------------------------------------------------------
// Typed errors specific to the Story Engine.
// ---------------------------------------------------------------------------

export class StoryEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoryEngineError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StoryBuilderError extends StoryEngineError {
  constructor(slideType: string, cause: unknown) {
    super(`Failed to build slide type "${slideType}": ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = "StoryBuilderError";
  }
}

export class InvalidStoryDeckError extends StoryEngineError {
  constructor(reason: string) {
    super(`Cannot compile story deck: ${reason}`);
    this.name = "InvalidStoryDeckError";
  }
}
