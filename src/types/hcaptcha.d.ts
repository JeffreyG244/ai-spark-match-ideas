
declare global {
  interface Window {
    hcaptcha: {
      render: (container: HTMLElement, config: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
      }) => string;
      reset: (widgetId?: string) => void;
      execute: (widgetId?: string) => void;
    };
  }
}

export {};
