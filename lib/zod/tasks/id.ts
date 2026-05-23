import { z } from "zod";

export const ZObjectId = z.object({
  id: z.string(),
});
