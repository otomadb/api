import { SemitagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { AddSemitagToVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const addSemitagToVideo = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { videoId: videoGqlId, name: semitagName } }, { user }) => {
    if (!user)
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.InvalidVideoId,
      };

    if (!(await prisma.video.findUnique({ where: { id: videoId.data } })))
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.VideoNotFound,
      };

    const tagging = await prisma.semitag.findFirst({
      where: { videoId: videoId.data, name: semitagName },
    });
    if (tagging && !tagging.isChecked)
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.AlreadyAttached,
      };
    else if (tagging && tagging.isChecked)
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.AlreadyChecked,
      };

    const semitagId = ulid();
    const [semitag] = await prisma.$transaction([
      prisma.semitag.create({
        data: { id: semitagId, name: semitagName, videoId: videoId.data, isChecked: false },
      }),
      prisma.semitagEvent.create({
        data: { userId: user.id, semitagId, type: SemitagEventType.ATTACHED, payload: {} },
      }),
    ]);

    return {
      __typename: "AddSemitagToVideoSuccessedPayload",
      semitag: new SemitagModel(semitag),
    };
  }) satisfies MutationResolvers["addSemitagToVideo"];
