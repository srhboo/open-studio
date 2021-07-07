import {
  getLeafGradMat,
  getLeafGradPinkMat,
  getLeafGradPixelBlueMat,
  getLeafGradAvocadoMat,
  getLeafGradJungleMat,
  getLeafGradGoopMat,
  getLeafGradGrungeMat,
} from "./leaf-grad";
import { getCustomMat } from "./custom";

export const DECAL_TYPES = {
  NONE: "NONE",
  CUSTOM: "CUSTOM",
  LEAF_GRAD: "LEAF_GRAD",
  LEAF_GRAD_PINK: "LEAF_GRAD_PINK",
  LEAF_GRAD_PIXEL_BLUE: "LEAF_GRAD_PIXEL_BLUE",
  LEAF_GRAD_AVOCADO: "LEAF_GRAD_AVOCADO",
  LEAF_GRAD_JUNGLE: "LEAF_GRAD_JUNGLE",
  LEAF_GRAD_GOOP: "LEAF_GRAD_GOOP",
  LEAF_GRAD_GRUNGE: "LEAF_GRAD_GRUNGE",
};

export const DECAL_MAT_FNS = {
  LEAF_GRAD: getLeafGradMat,
  LEAF_GRAD_PINK: getLeafGradPinkMat,
  LEAF_GRAD_PIXEL_BLUE: getLeafGradPixelBlueMat,
  LEAF_GRAD_AVOCADO: getLeafGradAvocadoMat,
  LEAF_GRAD_JUNGLE: getLeafGradJungleMat,
  LEAF_GRAD_GOOP: getLeafGradGoopMat,
  LEAF_GRAD_GRUNGE: getLeafGradGrungeMat,
  CUSTOM: getCustomMat,
};

export const DEFAULT_DECAL_TYPE = DECAL_TYPES.NONE;
