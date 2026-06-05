import { useEffect } from 'react';
import { getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import { mountScrollNavDrive, setScrollNavInfluence, unmountScrollNavDrive } from './scrollBridge';

type Props = {
  active: boolean;
};

/** Wheel / touch scroll shifts nav bubble orbit (DOM + metaball via shared bus). */
export default function ScrollNavDrive({ active }: Props) {
  useEffect(() => {
    if (!active) {
      unmountScrollNavDrive();
      return;
    }

    const teardown = mountScrollNavDrive({ influence: getSculpture().scrollInfluence });
    const unsub = subscribeSceneControls((s) => {
      setScrollNavInfluence(s.sculpture.scrollInfluence);
    });

    return () => {
      unsub();
      teardown();
    };
  }, [active]);

  return null;
}
