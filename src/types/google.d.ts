// Type definitions for Google APIs

declare interface Window {
  gapi: any;
  google: {
    picker: any;
    accounts: {
      oauth2: {
        initTokenClient(config: {
          client_id: string;
          scope: string;
          callback: (response: any) => void;
        }): {
          requestAccessToken(): void;
        };
      };
      id: {
        initialize(config: any): void;
        renderButton(element: HTMLElement, options: any): void;
        prompt(): void;
      };
    };
  };
  onApiLoad?: () => void;
}

declare namespace google {
  namespace picker {
    const Action: {
      PICKED: string;
      CANCEL: string;
    };
    const Feature: {
      NAV_HIDDEN: string;
      MULTISELECT_ENABLED: string;
    };
    const ViewId: {
      DOCS: string;
      FOLDERS: string;
    };
    const DocsViewMode: {
      LIST: string;
      GRID: string;
    };
    class View {
      constructor(viewId: string);
      setMimeTypes(mimeTypes: string): View;
      setIncludeFolders(include: boolean): View;
      setSelectFolderEnabled(enabled: boolean): View;
      setMode(mode: string): View;
      setLabel(label: string): View;
    }
    class DocsView extends View {
      constructor(viewId?: string);
    }
    class PickerBuilder {
      addView(view: View): PickerBuilder;
      enableFeature(feature: string): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setCallback(callback: (data: PickerData) => void): PickerBuilder;
      setTitle(title: string): PickerBuilder;
      build(): Picker;
    }
    interface Picker {
      setVisible(visible: boolean): void;
    }
    interface PickerData {
      action: string;
      docs: any[];
    }
  }
}
