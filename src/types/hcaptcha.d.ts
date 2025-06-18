
declare global {
  interface Window {
    hcaptcha: {
      render: (container: HTMLElement, config: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
      }) => void;
      reset: () => void;
      execute: () => void;
    };
  }
}

export {};
