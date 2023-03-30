/* eslint sort-keys: 2 */

import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";
import { addMylistToMylistGroup } from "./addMylistToMylistGroup/addMylistToMylistGroup.js";
import { addSemitagToVideo } from "./addSemitagToVideo/addSemitagToVideo.js";
import { resolverAddTagToVideo } from "./addTagToVideo/resolver.js";
import { addVideoToMylist } from "./addVideoToMylist/addVideoToMylist.js";
import { resolverChangeMylistShareRange } from "./changeMylistShareRange/resolver.js";
import { createMylist } from "./createMylist/createMylist.js";
import { createMylistGroup } from "./createMylistGroup/createMylistGroup.js";
import { resolverExplicitizeTagParent } from "./explicitizeTagParent/resolver.js";
import { resolverGenerateAccessToken } from "./generateAccessToken/resolver.js";
import { likeVideo } from "./likeVideo/likeVideo.js";
import { registerCategoryTag } from "./registerCategoryTag/resolver.js";
import { resolverRegisterCategoryTagTyping } from "./registerCategoryTagTyping/resolver.js";
import { resolverRegisterTag } from "./registerTag/resolver.js";
import { resolverRegisterTagParentRelation } from "./registerTagParentRelation/resolver.js";
import { resolverRegisterVideoFromNicovideo } from "./registerVideoFromNicovideo/resolver.js";
import { resolverRegisterVideoFromYoutube } from "./registerVideoFromYoutube/resolver.js";
import { resolverRejectRequestNicovideoRegistration } from "./rejectNicovideoRegistrationRequest/resolver.js";
import { resolverRejectSemitag } from "./rejectSemitag/resolver.js";
import { resolverRemoveTagFromVideo } from "./removeTagFromVideo/resolver.js";
import { removeVideoFromMylist } from "./removeVideoFromMylist/removeVideoFromMylist.js";
import { resolverRequestNicovideoRegistration as requestNicovideoRegistration } from "./requestNicovideoRegistration/resolver.js";
import { resolverResolveSemitag } from "./resolveSemitag/resolver.js";
import { signin } from "./signin/signin.js";
import { signout } from "./signout/signout.js";
import { resolverSignup } from "./signup/resolver.js";
import { undoLikeVideo } from "./undoLikeVideo/undoLikeVideo.js";

export const resolveMutation = (deps: ResolverDeps) =>
  ({
    addMylistToMylistGroup: addMylistToMylistGroup(deps),
    addSemitagToVideo: addSemitagToVideo(deps),
    addTagToVideo: resolverAddTagToVideo(deps),
    addVideoToMylist: addVideoToMylist(deps),
    changeMylistShareRange: resolverChangeMylistShareRange(deps),
    createMylist: createMylist(deps),
    createMylistGroup: createMylistGroup(deps),
    explicitizeTagParent: resolverExplicitizeTagParent(deps),
    generateAccessToken: resolverGenerateAccessToken(deps),
    likeVideo: likeVideo(deps),
    registerCategoryTag: registerCategoryTag(deps),
    registerCategoryTagTyping: resolverRegisterCategoryTagTyping(deps),
    registerTag: resolverRegisterTag(deps),
    registerTagParentRelation: resolverRegisterTagParentRelation(deps),
    registerVideoFromNicovideo: resolverRegisterVideoFromNicovideo(deps),
    registerVideoFromYoutube: resolverRegisterVideoFromYoutube(deps),
    rejectNicovideoRegistrationRequest: resolverRejectRequestNicovideoRegistration(deps),
    rejectSemitag: resolverRejectSemitag(deps),
    removeTagFromVideo: resolverRemoveTagFromVideo(deps),
    removeVideoFromMylist: removeVideoFromMylist(deps),
    requestNicovideoRegistration: requestNicovideoRegistration(deps),
    resovleSemitag: resolverResolveSemitag(deps),
    signin: signin(deps),
    signout: signout(deps),
    signup: resolverSignup(deps),
    undoLikeVideo: undoLikeVideo(deps),
  } satisfies Resolvers["Mutation"]);
