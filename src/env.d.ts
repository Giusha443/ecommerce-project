declare interface Env {
  readonly NODE_ENV: string;
  readonly NG_APP_CTP_PROJECT_KEY: string;
  readonly NG_APP_CTP_CLIENT_SECRET: string;
  readonly NG_APP_CTP_CLIENT_ID: string;
  readonly NG_APP_CTP_AUTH_URL: string;
  readonly NG_APP_CTP_API_URL: string;
  readonly NG_APP_CTP_SCOPES: string;
}

declare interface ImportMeta {
  readonly env: Env;
}

declare const _NGX_ENV_: Env;
