import { PrismaClient } from "@prisma/client";

import { VideoDTO } from "../Video/dto.js";

export const mkVideoService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.video.findUniqueOrThrow({ where: { id } }).then((v) => VideoDTO.fromPrisma(v));
    },
  };
};

export type VideoService = ReturnType<typeof mkVideoService>;
