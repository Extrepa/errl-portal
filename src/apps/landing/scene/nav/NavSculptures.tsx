import { useEffect } from 'react';
import MetaballNavCanvas from '../effects/MetaballNavCanvas';
import { applyNavRenderModeToDocument } from '../navRenderMode';

type Props = {
  showPost?: boolean;
};

export default function NavSculptures({ showPost = true }: Props) {
  useEffect(() => {
    applyNavRenderModeToDocument('metaball');
    return () => {
      applyNavRenderModeToDocument();
    };
  }, []);

  return <MetaballNavCanvas showLabels showPost={showPost} />;
}
