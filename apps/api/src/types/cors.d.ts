declare module "cors" {
  import type { RequestHandler } from "express";

  type CorsOptions = {
    credentials?: boolean;
    origin?: boolean | string | RegExp | Array<string | RegExp> | ((origin: string | undefined, callback: (error: Error | null, origin?: boolean) => void) => void);
  };

  function cors(options?: CorsOptions): RequestHandler;
  export = cors;
}
