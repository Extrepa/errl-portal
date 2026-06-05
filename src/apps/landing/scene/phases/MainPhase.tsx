import NavSculptures from '../nav/NavSculptures';
import { isMetaballNavActive } from '../navRenderMode';

export default function MainPhase() {
  if (!isMetaballNavActive()) return null;
  return <NavSculptures />;
}
