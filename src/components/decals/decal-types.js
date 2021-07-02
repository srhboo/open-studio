import { getLeafGradMat, getLeafGradPinkMat } from "./leaf-grad";

export const DECAL_TYPES = {
  NONE: "NONE",
  LEAF_GRAD: "LEAF_GRAD",
  LEAF_GRAD_PINK: "LEAF_GRAD_PINK",
};

export const DECAL_MAT_FNS = {
  LEAF_GRAD: getLeafGradMat,
  LEAF_GRAD_PINK: getLeafGradPinkMat,
};

export const DEFAULT_DECAL_TYPE = DECAL_TYPES.LEAF_GRAD;
