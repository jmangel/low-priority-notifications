// Global declarations for TypeScript

// Make gapi available globally
declare const gapi: any;

// Google Picker API
declare namespace google {
  namespace picker {
    interface Document {
      id: string;
      name: string;
      mimeType: string;
      description: string;
      type: string;
    }

    interface PickerData {
      action: string;
      docs: Document[];
      viewToken: string[];
    }

    const Action: {
      CANCEL: string;
      PICKED: string;
    };

    const ViewId: {
      DOCS: string;
      FOLDERS: string;
      DOCS_IMAGES: string;
      DOCS_VIDEOS: string;
      DOCS_AUDIO: string;
      SPREADSHEETS: string;
      PRESENTATIONS: string;
      DOCS_UPLOAD: string;
      PHOTO_ALBUMS: string;
      PHOTOS: string;
      PHOTO_UPLOAD: string;
    };

    class DocsView {
      constructor(viewId: string);
      setMimeTypes(mimeTypes: string): DocsView;
      setSelectFolderEnabled(enabled: boolean): DocsView;
    }

    class PickerBuilder {
      addView(view: DocsView): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setCallback(callback: (data: PickerData) => void): PickerBuilder;
      build(): Picker;
    }

    class Picker {
      setVisible(visible: boolean): void;
    }
  }
}

// Add environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_GOOGLE_CLIENT_ID: string;
    REACT_APP_GOOGLE_PICKER_API_KEY: string;
  }
}
