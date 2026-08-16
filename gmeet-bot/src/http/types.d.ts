export {};

declare module "express-serve-static-core" {
  interface Request {
    sessionToken?: string;
  }
}
