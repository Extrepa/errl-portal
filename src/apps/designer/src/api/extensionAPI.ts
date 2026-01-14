/**
 * Extension API
 * Plugin system for custom functionality
 */

export interface ExtensionHook {
  vibeGenerator?: (params: any) => any;
  exportTransform?: (data: any) => any;
  customInspector?: React.ComponentType;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  hooks: ExtensionHook;
}

export interface ExtensionRegistry {
  register: (extension: Extension) => void;
  unregister: (id: string) => void;
  get: (id: string) => Extension | undefined;
  getAll: () => Extension[];
  getHooks: (hookType: keyof ExtensionHook) => Array<Extension['hooks'][keyof ExtensionHook]>;
}

class ExtensionRegistryImpl implements ExtensionRegistry {
  private extensions: Map<string, Extension> = new Map();

  register(extension: Extension): void {
    this.extensions.set(extension.id, extension);
  }

  unregister(id: string): void {
    this.extensions.delete(id);
  }

  get(id: string): Extension | undefined {
    return this.extensions.get(id);
  }

  getAll(): Extension[] {
    return Array.from(this.extensions.values());
  }

  getHooks(hookType: keyof ExtensionHook): Array<Extension['hooks'][keyof ExtensionHook]> {
    return Array.from(this.extensions.values())
      .map((ext) => ext.hooks[hookType])
      .filter((hook) => hook !== undefined) as any[];
  }
}

// Singleton registry
let registryInstance: ExtensionRegistry | null = null;

export const getExtensionRegistry = (): ExtensionRegistry => {
  if (!registryInstance) {
    registryInstance = new ExtensionRegistryImpl();
  }
  return registryInstance;
};

