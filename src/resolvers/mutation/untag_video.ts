import { GraphQLError } from "graphql";

import { TagModel, UserModel, VideoModel } from "~/codegen/models.js";
import { MutationResolvers } from "~/codegen/resolvers.js";
import { dataSource } from "~/db/data-source.js";
import { VideoTag } from "~/db/entities/video_tags.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "~/utils/id.js";

export const untagVideo: MutationResolvers["untagVideo"] = async (_parent, { input: { tagId, videoId } }, { user }) => {
  if (!user) {
    throw new GraphQLError("required to sign in");
  }

  const repository = dataSource.getRepository(VideoTag);

  const videoTag = await repository.findOne({
    relations: {
      tag: true,
      video: true,
    },
    where: {
      video: { id: removeIDPrefix(ObjectType.Video, videoId) },
      tag: { id: removeIDPrefix(ObjectType.Tag, tagId) },
    },
  });
  if (!videoTag) {
    throw new GraphQLError("Not Found");
  }

  await repository.remove(videoTag);

  return {
    createdAt: new Date(),
    id: addIDPrefix(ObjectType.VideoTag, videoTag.id),
    tag: new TagModel(videoTag.tag),
    user: new UserModel(user),
    video: new VideoModel(videoTag.video),
  };
};
