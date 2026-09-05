declare module "bun" {
  interface Env {
    SERVER_PORT: number;
    HARDCOVER_BASE_URL: string;
    HARDCOVER_API_KEY: string;
  }
}
