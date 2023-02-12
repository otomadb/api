import { NicovideoVideoSourceEvent } from "@prisma/client";

export class NicovideoVideoSourceEventModel {
  constructor(protected readonly event: NicovideoVideoSourceEvent) {}

  get id() {
    return this.event.id;
  }

  get userId() {
    return this.event.userId;
  }

  get sourceId() {
    return this.event.sourceId;
  }

  get type() {
    return this.event.type;
  }
}