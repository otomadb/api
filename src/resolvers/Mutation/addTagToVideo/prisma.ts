import { Tag, Video, VideoTag, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const add = async (
  prisma: ResolverDeps["prisma"],
  { authUserId: userId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"EXISTS_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  const exists = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (exists && !exists.isRemoved) return err("EXISTS_TAGGING");

  if (exists) {
    // reattach
    const tagging = await prisma.videoTag.update({
      where: { id: exists.id },
      data: {
        isRemoved: false,
        events: {
          create: {
            userId,
            type: VideoTagEventType.REATTACH,
            payload: {},
          },
        },
      },
      include: { video: true, tag: true },
    });

    return ok(tagging);
  } else {
    // attach
    const id = ulid();
    const tagging = await prisma.videoTag.create({
      data: {
        id,
        tagId,
        videoId,
        isRemoved: false,
        events: {
          create: {
            userId,
            type: VideoTagEventType.ATTACH,
            payload: {},
          },
        },
      },
      include: { video: true, tag: true },
    });

    return ok(tagging);
  }
};
