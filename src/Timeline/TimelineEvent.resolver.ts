import { MkResolverWithInclude } from "../utils/MkResolver.js";
import {
  BilibiliMadRequestedTimelineEventDTO,
  MadRegisteredTimelineEventDTO,
  NicovideoMadRequestedTimelineEventDTO,
  SoundcloudMadRequestedTimelineEventDTO,
  YoutubeMadRequestedTimelineEventDTO,
} from "./TimelineEvent.dto.js";

export const mkMadRegisteredTimelineEventResolver: MkResolverWithInclude<
  "MadRegisteredTimelineEvent",
  "VideoService" | "VideoEventService"
> = ({ VideoService, VideoEventService }) => ({
  __isTypeOf: (v) => v instanceof MadRegisteredTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  video: ({ videoId }) => VideoService.getByIdOrThrow(videoId),
  event: ({ eventId }) => VideoEventService.getByIdOrThrow(eventId),
});

export const mkNicovideoMadRequestedTimelineEventResolver: MkResolverWithInclude<
  "NicovideoMadRequestedTimelineEvent",
  "NicovideoRegistrationRequestService" | "NicovideoRegistrationRequestEventService"
> = ({ NicovideoRegistrationRequestService, NicovideoRegistrationRequestEventService }) => ({
  __isTypeOf: (v) => v instanceof NicovideoMadRequestedTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  request: ({ requestId }) => NicovideoRegistrationRequestService.getByIdOrThrow(requestId),
  event: ({ eventId }) => {
    return NicovideoRegistrationRequestEventService.getByIdOrThrow(eventId);
  },
});

export const mkYoutubeMadRequestedTimelineEventResolver: MkResolverWithInclude<
  "YoutubeMadRequestedTimelineEvent",
  "YoutubeRegistrationRequestService" | "YoutubeRegistrationRequestEventService"
> = ({ YoutubeRegistrationRequestService, YoutubeRegistrationRequestEventService }) => ({
  __isTypeOf: (v) => v instanceof YoutubeMadRequestedTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  request: ({ requestId }) => YoutubeRegistrationRequestService.getByIdOrThrow(requestId),
  event: ({ eventId }) => {
    return YoutubeRegistrationRequestEventService.getByIdOrThrow(eventId);
  },
});

export const mkSoundcloudMadRequestedTimelineEventResolver: MkResolverWithInclude<
  "SoundcloudMadRequestedTimelineEvent",
  "SoundcloudRegistrationRequestService" | "SoundcloudRegistrationRequestEventService"
> = ({ SoundcloudRegistrationRequestService, SoundcloudRegistrationRequestEventService }) => ({
  __isTypeOf: (v) => v instanceof SoundcloudMadRequestedTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  request: ({ requestId }) => SoundcloudRegistrationRequestService.getByIdOrThrow(requestId),
  event: ({ eventId }) => {
    return SoundcloudRegistrationRequestEventService.getByIdOrThrow(eventId);
  },
});

export const mkBilibiliMadRequestedTimelineEventResolver: MkResolverWithInclude<
  "BilibiliMadRequestedTimelineEvent",
  "BilibiliRegistrationRequestService" | "BilibiliRegistrationRequestEventService"
> = ({ BilibiliRegistrationRequestService, BilibiliRegistrationRequestEventService }) => ({
  __isTypeOf: (v) => v instanceof BilibiliMadRequestedTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  request: ({ requestId }) => BilibiliRegistrationRequestService.getByIdOrThrow(requestId),
  event: ({ eventId }) => {
    return BilibiliRegistrationRequestEventService.getByIdOrThrow(eventId);
  },
});
