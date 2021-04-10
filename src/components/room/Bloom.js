import * as THREE from "three";
import { UnrealBloomPass } from "../../utils/three-jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "../../utils/three-jsm/postprocessing/EffectComposer.js";
import { ShaderPass } from "../../utils/three-jsm/postprocessing/ShaderPass.js";
import { RenderPass } from "../../utils/three-jsm/postprocessing/RenderPass.js";
import {
  userVertexShader,
  userFragmentShader,
} from "../../shaders/user-shaders";

export const disposeMaterial = (obj) => {
  if (obj.material) {
    obj.material.dispose();
  }
};

export const BLOOM_SCENE = 1;

export const setupBloom = ({ scene, camera, renderer }) => {
  const renderScene = new RenderPass(scene, camera);

  const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });

  const materials = {};
  const bloomLayer = new THREE.Layers();
  bloomLayer.set(BLOOM_SCENE);

  function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }
  function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  }

  const params = {
    exposure: 1,
    bloomStrength: 5,
    bloomThreshold: 0,
    bloomRadius: 0,
    scene: "Scene with Glow",
  };
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: userVertexShader,
      fragmentShader: userFragmentShader,
      defines: {},
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(finalPass);

  const render = () => {
    // renderer.render(scene, camera);
    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);

    // render the entire scene, then render bloom scene on top
    finalComposer.render();
  };

  return { render };
};
