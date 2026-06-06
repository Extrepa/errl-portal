import { useEffect } from 'react';
import MetaballNavLinks from './MetaballNavLinks';
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
  return <MetaballNavLinks />;
}
