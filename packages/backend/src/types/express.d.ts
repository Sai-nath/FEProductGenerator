// This file augments the Express namespace with custom type definitions

declare namespace Express {
  export interface Request {
    // We're not extending params/body here as it would conflict with Express's own types
  }
}
