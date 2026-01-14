import type { Prefab, SceneLayer, SceneObject } from '../state/types';
import { generateId } from './helpers';

/**
 * Create a prefab representing the Errl rig with suggested vibe stacks.
 * This uses placeholders for assets/components; caller should ensure referenced assets exist.
 */
export const createErrlPrefab = (): Prefab => {
  const bodyId = generateId('errl_body');
  const bubbleId = generateId('errl_bubble');
  const eyeLId = generateId('errl_eyeL');
  const eyeRId = generateId('errl_eyeR');
  const trailId = generateId('errl_trail');
  const groupId = generateId('group_errl');

  const layer: SceneLayer = {
    id: 'layer_errl',
    name: 'Errl',
    objects: [],
  };

  const body: SceneObject = {
    id: bodyId,
    ref: 'errl_body_asset',
    x: 100,
    y: 100,
    z: 1,
    scale: 1,
    group_id: groupId,
  };

  const bubble: SceneObject = {
    id: bubbleId,
    ref: 'errl_bubble_asset',
    x: 110,
    y: 90,
    z: 2,
    scale: 1,
    group_id: groupId,
  };

  const eyeL: SceneObject = {
    id: eyeLId,
    ref: 'errl_eye_asset',
    x: 90,
    y: 95,
    z: 3,
    scale: 0.8,
    group_id: groupId,
  };

  const eyeR: SceneObject = {
    id: eyeRId,
    ref: 'errl_eye_asset',
    x: 110,
    y: 95,
    z: 3,
    scale: 0.8,
    group_id: groupId,
  };

  const trail: SceneObject = {
    id: trailId,
    ref: 'errl_trail_asset',
    x: 100,
    y: 130,
    z: 0,
    scale: 1,
    group_id: groupId,
  };

  layer.objects.push(body, bubble, eyeL, eyeR, trail);

  return {
    id: generateId('prefab'),
    name: 'Errl Rig',
    sceneGraph: {
      layers: [layer],
      objects: layer.objects,
    },
  };
};
