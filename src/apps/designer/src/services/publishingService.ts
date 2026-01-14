/**
 * Cloud Publishing Service
 * Handles CDN upload and loader script generation
 */

import type { Project } from '../state/types';
import { serializeProject } from '../utils/manifestSerializer';

export interface PublishOptions {
  version?: string;
  environment?: 'draft' | 'live';
  public?: boolean;
}

export interface PublishResult {
  url: string;
  loaderScript: string;
  cdnUrl: string;
}

export interface PublishingService {
  publish: (project: Project, options?: PublishOptions) => Promise<PublishResult>;
  getLoaderScript: (cdnUrl: string) => string;
}

class PublishingServiceImpl implements PublishingService {
  async publish(project: Project, options: PublishOptions = {}): Promise<PublishResult> {
    const projectJson = serializeProject(project);
    const blob = new Blob([projectJson], { type: 'application/json' });
    const cdnUrl = URL.createObjectURL(blob);

    return {
      url: cdnUrl,
      loaderScript: this.getLoaderScript(cdnUrl),
      cdnUrl,
    };
  }

  getLoaderScript(cdnUrl: string): string {
    return `<script src="${cdnUrl}" data-project-loader></script>`;
  }
}

// Singleton instance
let publishingInstance: PublishingService | null = null;

export const getPublishingService = (): PublishingService => {
  if (!publishingInstance) {
    publishingInstance = new PublishingServiceImpl();
  }
  return publishingInstance;
};
