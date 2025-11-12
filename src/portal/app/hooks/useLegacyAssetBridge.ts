import { useEffect } from 'react';
import type { RefObject } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - legacy module ships without TypeScript types
import { listAssets, getAssetBlob, saveAsset, removeAsset } from '@/utils/assetStore.js';

type LegacyAssetRequest =
  | {
      type: 'legacy-asset:list';
      requestId?: string;
    }
  | {
      type: 'legacy-asset:get';
      requestId?: string;
      payload?: { id?: string };
    }
  | {
      type: 'legacy-asset:save';
      requestId?: string;
      payload?: { id?: string; name?: string; mimeType?: string; dataUrl?: string };
    }
  | {
      type: 'legacy-asset:remove';
      requestId?: string;
      payload?: { id?: string };
    };

type LegacyAssetResponse =
  | {
      type: 'legacy-asset:list:response';
      requestId?: string;
      payload: Array<{
        id: string;
        name?: string;
        type?: string;
        size?: number;
        updatedAt?: number;
      }>;
    }
  | {
      type: 'legacy-asset:get:response';
      requestId?: string;
      payload: {
        id: string;
        dataUrl: string | null;
      };
    }
  | {
      type: 'legacy-asset:save:response';
      requestId?: string;
      payload: {
        id: string;
        name?: string;
        type?: string;
        size?: number;
      };
    }
  | {
      type: 'legacy-asset:remove:response';
      requestId?: string;
      payload: {
        id: string;
      };
    }
  | {
      type: 'legacy-asset:error';
      requestId?: string;
      payload: {
        message: string;
      };
    };

function isAssetMessage(value: unknown): value is LegacyAssetRequest {
  if (!value || typeof value !== 'object') return false;
  const { type } = value as { type?: unknown };
  return (
    type === 'legacy-asset:list' ||
    type === 'legacy-asset:get' ||
    type === 'legacy-asset:save' ||
    type === 'legacy-asset:remove'
  );
}

function postToIframe(ref: RefObject<HTMLIFrameElement | null>, message: LegacyAssetResponse) {
  const target = ref.current?.contentWindow;
  if (!target) return;
  target.postMessage(message, '*');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<{ blob: Blob; type: string }> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const type = blob.type || 'application/octet-stream';
    return { blob, type };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to decode data URL');
  }
}

function getSafeId(existing?: string): string {
  if (existing) return existing;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useLegacyAssetBridge(iframeRef: RefObject<HTMLIFrameElement | null>) {
  useEffect(() => {
    function handler(event: MessageEvent) {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      if (!isAssetMessage(event.data)) return;

      const request = event.data;
      const requestId = request.requestId;

      if (request.type === 'legacy-asset:list') {
        listAssets()
          .then((assets: any[]) => {
            const payload = assets.map((asset) => ({
              id: asset?.id,
              name: asset?.name,
              type: asset?.type,
              size: asset?.size,
              updatedAt: asset?.updatedAt,
            }));
            postToIframe(iframeRef, {
              type: 'legacy-asset:list:response',
              requestId,
              payload,
            });
          })
          .catch((error: Error) => {
            postToIframe(iframeRef, {
              type: 'legacy-asset:error',
              requestId,
              payload: { message: error?.message ?? 'Failed to list assets' },
            });
          });
        return;
      }

      if (request.type === 'legacy-asset:get') {
        const id = request.payload?.id;
        if (!id) {
          postToIframe(iframeRef, {
            type: 'legacy-asset:error',
            requestId,
            payload: { message: 'Missing asset id' },
          });
          return;
        }
        getAssetBlob(id)
          .then(async (blob: Blob | null) => {
            const dataUrl = blob ? await blobToDataUrl(blob) : null;
            postToIframe(iframeRef, {
              type: 'legacy-asset:get:response',
              requestId,
              payload: { id, dataUrl },
            });
          })
          .catch((error: Error) => {
            postToIframe(iframeRef, {
              type: 'legacy-asset:error',
              requestId,
              payload: { message: error?.message ?? 'Failed to read asset' },
            });
          });
        return;
      }

      if (request.type === 'legacy-asset:save') {
        const { name, dataUrl, mimeType, id } = request.payload ?? {};
        if (!name || !dataUrl) {
          postToIframe(iframeRef, {
            type: 'legacy-asset:error',
            requestId,
            payload: { message: 'Missing asset name or data' },
          });
          return;
        }

        dataUrlToBlob(dataUrl)
          .then(async ({ blob, type }) => {
            const assetId = getSafeId(id);
            const savedType = mimeType || type || 'application/octet-stream';
            await saveAsset({ id: assetId, name, type: savedType, size: blob.size, blob });
            postToIframe(iframeRef, {
              type: 'legacy-asset:save:response',
              requestId,
              payload: { id: assetId, name, type: savedType, size: blob.size },
            });
          })
          .catch((error: Error) => {
            postToIframe(iframeRef, {
              type: 'legacy-asset:error',
              requestId,
              payload: { message: error?.message ?? 'Failed to save asset' },
            });
          });
        return;
      }

      if (request.type === 'legacy-asset:remove') {
        const id = request.payload?.id;
        if (!id) {
          postToIframe(iframeRef, {
            type: 'legacy-asset:error',
            requestId,
            payload: { message: 'Missing asset id' },
          });
          return;
        }
        removeAsset(id)
          .then(() => {
            postToIframe(iframeRef, {
              type: 'legacy-asset:remove:response',
              requestId,
              payload: { id },
            });
          })
          .catch((error: Error) => {
            postToIframe(iframeRef, {
              type: 'legacy-asset:error',
              requestId,
              payload: { message: error?.message ?? 'Failed to remove asset' },
            });
          });
      }
    }

    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [iframeRef]);
}
