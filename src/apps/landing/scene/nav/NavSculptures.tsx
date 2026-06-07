import { useEffect } from 'react';
import MetaballNavLinks from './MetaballNavLinks';
import { NavPhysicsProvider } from './NavPhysicsContext';
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

  void showPost;
  return (
    <NavPhysicsProvider>
      <MetaballNavLinks flatLabels useGooField />
    </NavPhysicsProvider>
  );
}
