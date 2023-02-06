import { usePostProcessingEffect } from "render-composer";
import * as PP from "postprocessing";

export const PixelationEffect = ({
  granularity = 4,
}: {
  granularity?: number;
}) => {
  usePostProcessingEffect(
    () => new PP.PixelationEffect(granularity),
    [
      {
        granularity,
      },
    ]
  );

  return null;
};
