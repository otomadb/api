/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production";

    readonly ENABLE_GRAPHIQL?: string;
    // readonly ENABLE_INTROSPECTION?: string;
    readonly ENABLE_SAME_SITE_NONE?: string;

    readonly PRISMA_DATABASE_URL: string;

    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;

    /* test */
    readonly TEST_PRISMA_DATABASE_URL: string;
    readonly TEST_NEO4J_URL: string;
    readonly TEST_NEO4J_USERNAME: string;
    readonly TEST_NEO4J_PASSWORD: string;
  }
}
