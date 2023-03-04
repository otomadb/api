/* eslint sort-keys: 2 */

import { PrismaClient } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

import { type Resolvers } from "./graphql.js";
import { resolveMutation } from "./Mutation/index.js";
import { resolveMylist } from "./Mylist/index.js";
import { resolveMylistGroup } from "./MylistGroup/index.js";
import { resolveMylistGroupMylistInclusion } from "./MylistGroupMylistInclusion/index.js";
import { resolveMylistGroupVideoAggregation } from "./MylistGroupVideoAggregation/index.js";
import { resolveMylistRegistration } from "./MylistRegistration/index.js";
import { resolveMylistTagInclusion } from "./MylistTagInclusion/index.js";
import { resolveMylistVideoRecommendation } from "./MylistVideoRecommendation/index.js";
import { resolveNicovideoOriginalSourceTag } from "./NicovideoOriginalSourceTag/index.js";
import { resolverNicovideoRegistrationRequest } from "./NicovideoRegistrationRequest/resolver.js";
import { resolverNicovideoRegistrationRequestConnection } from "./NicovideoRegistrationRequestConnection/resolver.js";
import { resolverNicovideoRegistrationRequestRejecting } from "./NicovideoRegistrationRequestRejecting/resolver.js";
import { resolveNicovideoVideoSource } from "./NicovideoVideoSource/index.js";
import {
  resolveNicovideoVideoSourceCreateEvent,
  resolveNicovideoVideoSourceEvent,
} from "./NicovideoVideoSourceEvent/index.js";
import { resolveQuery } from "./Query/index.js";
import { resolveSemitag, resolveSemitagRejecting, resolveSemitagResolving } from "./Semitag/index.js";
import { resolverSemitagConnection } from "./SemitagConnection/resolver.js";
import {
  resolveSemitagEvent,
  resolveSemitagEventAttachEvent,
  resolveSemitagEventRejectEvent,
  resolveSemitagEventResolveEvent,
} from "./SemitagEvent/index.js";
import { resolveSession } from "./Session/index.js";
import { resolveTag } from "./Tag/index.js";
import { resolveTagEvent, resolveTagRegisterEvent } from "./TagEvent/index.js";
import { resolveTagName } from "./TagName/index.js";
import {
  resolveTagNameCreateEvent,
  resolveTagNameEvent,
  resolveTagNameSetPrimaryEvent,
  resolveTagNameUnsetPrimaryEvent,
} from "./TagNameEvent/index.js";
import { resolveUser } from "./User/index.js";
import { resolveVideo } from "./Video/index.js";
import { resolverVideoConnection } from "./VideoConnection/resolver.js";
import { resolveVideoEvent, resolveVideoRegisterEvent } from "./VideoEvent/index.js";
import { resolveVideoSimilarity } from "./VideoSimilarity/index.js";
import { resolveVideoTag } from "./VideoTag/index.js";
import {
  resolveVideoTagAttachEvent,
  resolveVideoTagDetachEvent,
  resolveVideoTagEvent,
  resolveVideoTagReattachEvent,
} from "./VideoTagEvent/index.js";
import { resolveVideoThumbnail } from "./VideoThumbnail/index.js";
import {
  resolveVideoThumbnailCreateEvent,
  resolveVideoThumbnailEvent,
  resolveVideoThumbnailSetPrimaryEvent,
  resolveVideoThumbnailUnsetPrimaryEvent,
} from "./VideoThumbnailEvent/index.js";
import { resolveVideoTitle } from "./VideoTitle/index.js";
import {
  resolveVideoTitleCreateEvent,
  resolveVideoTitleEvent,
  resolveVideoTitleSetPrimaryEvent,
  resolveVideoTitleUnsetPrimaryEvent,
} from "./VideoTitleEvent/index.js";

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  logger: Logger;
  config: {
    session: {
      cookieName(): string;
      cookieDomain(): string | undefined;
      cookieSameSite(): "none" | "strict";
    };
  };
};

export const makeResolvers = (deps: ResolverDeps) =>
  ({
    Mutation: resolveMutation(deps),
    Mylist: resolveMylist(deps),
    MylistGroup: resolveMylistGroup(deps),
    MylistGroupMylistInclusion: resolveMylistGroupMylistInclusion(deps),
    MylistGroupVideoAggregation: resolveMylistGroupVideoAggregation(deps),
    MylistRegistration: resolveMylistRegistration(deps),
    MylistTagInclusion: resolveMylistTagInclusion(deps),
    MylistVideoRecommendation: resolveMylistVideoRecommendation(deps),
    NicovideoOriginalSourceTag: resolveNicovideoOriginalSourceTag(deps),
    NicovideoRegistrationRequest: resolverNicovideoRegistrationRequest(deps),
    NicovideoRegistrationRequestConnection: resolverNicovideoRegistrationRequestConnection(),
    NicovideoRegistrationRequestRejecting: resolverNicovideoRegistrationRequestRejecting(deps),
    NicovideoVideoSource: resolveNicovideoVideoSource(deps),
    NicovideoVideoSourceCreateEvent: resolveNicovideoVideoSourceCreateEvent(deps),
    NicovideoVideoSourceEvent: resolveNicovideoVideoSourceEvent(),
    Query: resolveQuery(deps),
    Semitag: resolveSemitag(deps),
    SemitagAttachEvent: resolveSemitagEventAttachEvent(deps),
    SemitagConnection: resolverSemitagConnection(),
    SemitagEvent: resolveSemitagEvent(),
    SemitagRejectEvent: resolveSemitagEventRejectEvent(deps),
    SemitagRejecting: resolveSemitagRejecting(deps),
    SemitagResolveEvent: resolveSemitagEventResolveEvent(deps),
    SemitagResolving: resolveSemitagResolving(deps),
    Session: resolveSession(deps),
    Tag: resolveTag(deps),
    TagEvent: resolveTagEvent(),
    TagName: resolveTagName(deps),
    TagNameCreateEvent: resolveTagNameCreateEvent(deps),
    TagNameEvent: resolveTagNameEvent(),
    TagNameSetPrimaryEvent: resolveTagNameSetPrimaryEvent(deps),
    TagNameUnsetPrimaryEvent: resolveTagNameUnsetPrimaryEvent(deps),
    TagRegisterEvent: resolveTagRegisterEvent(deps),
    User: resolveUser(deps),
    Video: resolveVideo(deps),
    VideoConnection: resolverVideoConnection(),
    VideoEvent: resolveVideoEvent(),
    VideoRegisterEvent: resolveVideoRegisterEvent(deps),
    VideoSimilarity: resolveVideoSimilarity(deps),
    VideoTag: resolveVideoTag(deps),
    VideoTagAttachEvent: resolveVideoTagAttachEvent(deps),
    VideoTagDetachEvent: resolveVideoTagDetachEvent(deps),
    VideoTagEvent: resolveVideoTagEvent(),
    VideoTagReattachEvent: resolveVideoTagReattachEvent(deps),
    VideoThumbnail: resolveVideoThumbnail(deps),
    VideoThumbnailCreateEvent: resolveVideoThumbnailCreateEvent(deps),
    VideoThumbnailEvent: resolveVideoThumbnailEvent(),
    VideoThumbnailSetPrimaryEvent: resolveVideoThumbnailSetPrimaryEvent(deps),
    VideoThumbnailUnsetPrimaryEvent: resolveVideoThumbnailUnsetPrimaryEvent(deps),
    VideoTitle: resolveVideoTitle(deps),
    VideoTitleCreateEvent: resolveVideoTitleCreateEvent(deps),
    VideoTitleEvent: resolveVideoTitleEvent(),
    VideoTitleSetPrimaryEvent: resolveVideoTitleSetPrimaryEvent(deps),
    VideoTitleUnsetPrimaryEvent: resolveVideoTitleUnsetPrimaryEvent(deps),
  } satisfies Resolvers);
