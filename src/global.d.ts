/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production";

    readonly ENABLE_GRAPHIQL?: string;
    // readonly ENABLE_INTROSPECTION?: string;

    readonly AUTH0_DOMAIN: string;
    readonly AUTH0_MANAGEMENT_API_TOKEN: string;

    readonly PRISMA_DATABASE_URL: string;

    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;

    /* Meilisearch */
    readonly MEILISEARCH_URL: string;
  }
}
