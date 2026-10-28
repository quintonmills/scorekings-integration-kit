declare global {
  namespace Express {
    interface Locals {
      partnerId?: string;
    }
  }
}

export {};
