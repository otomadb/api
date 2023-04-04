import { IncomingMessage, ServerResponse } from "node:http";

import { PrismaClient } from "@prisma/client";
import { AppMetadata, ManagementClient, User, UserMetadata } from "auth0";
import { MeiliSearch } from "meilisearch";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

export type Auth0User = User<AppMetadata, UserMetadata>;
export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  meilisearch: MeiliSearch;
  logger: Logger;
  auth0Management: ManagementClient<AppMetadata, UserMetadata>;
};
export type ServerContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

export type CurrentUser = {
  id: string;
  scopes: string[];
};
export type UserContext = {
  currentUser: CurrentUser;
};

export type Context = ServerContext & UserContext;
