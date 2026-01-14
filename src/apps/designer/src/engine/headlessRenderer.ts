import type { Project } from '../state/types';
import { exportStaticSVG, exportStaticPNG } from './exporters/StaticExporter';

export const renderHeadlessSVG = (project: Project): string => {
  return exportStaticSVG(project);
};

export const renderHeadlessPNG = async (project: Project): Promise<Blob> => {
  return exportStaticPNG(project);
};
