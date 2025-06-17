
declare global {
  interface Window {
    paypal: any;
  }
}

export const loadPayPalScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if PayPal is already loaded
    if (window.paypal) {
      resolve();
      return;
    }

    // Remove any existing PayPal scripts
    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
      existingScript.remove();
    }

    // For hosted buttons, we can use a simplified approach without client-id
    // This will work with your actual hosted button IDs
    const script = document.createElement('script');
    script.src = 'https://www.paypalobjects.com/api/checkout.js';
    
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      // Set up a simple paypal object for hosted buttons
      if (!window.paypal) {
        window.paypal = {
          HostedButtons: (config: any) => ({
            render: (selector: string) => {
              const container = document.querySelector(selector);
              if (container) {
                // Create a form element with the hosted button
                const form = document.createElement('form');
                form.action = 'https://www.paypal.com/cgi-bin/webscr';
                form.method = 'post';
                form.target = '_top';
                
                const cmdInput = document.createElement('input');
                cmdInput.type = 'hidden';
                cmdInput.name = 'cmd';
                cmdInput.value = '_s-xclick';
                
                const buttonIdInput = document.createElement('input');
                buttonIdInput.type = 'hidden';
                buttonIdInput.name = 'hosted_button_id';
                buttonIdInput.value = config.hostedButtonId;
                
                const currencyInput = document.createElement('input');
                currencyInput.type = 'hidden';
                currencyInput.name = 'currency_code';
                currencyInput.value = 'USD';
                
                const submitButton = document.createElement('input');
                submitButton.type = 'image';
                submitButton.src = 'https://www.paypalobjects.com/en_US/i/btn/btn_paynowCC_LG.gif';
                submitButton.alt = 'Buy Now';
                submitButton.title = 'PayPal - The safer, easier way to pay online!';
                submitButton.style.border = '0';
                
                form.appendChild(cmdInput);
                form.appendChild(buttonIdInput);
                form.appendChild(currencyInput);
                form.appendChild(submitButton);
                
                container.innerHTML = '';
                container.appendChild(form);
              }
            }
          })
        };
      }
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load PayPal SDK:', error);
      reject(new Error('Failed to load PayPal SDK. Please check your internet connection and try again.'));
    };
    
    document.head.appendChild(script);
  });
};

export const createPayPalHostedButton = (containerId: string, hostedButtonId: string) => {
  if (!window.paypal) {
    throw new Error('PayPal SDK not loaded');
  }

  try {
    return window.paypal.HostedButtons({
      hostedButtonId: hostedButtonId,
    }).render(`#${containerId}`);
  } catch (error) {
    console.error('Error creating PayPal hosted button:', error);
    throw new Error('Failed to create PayPal button. Please try again.');
  }
};

export const createPayPalContainer = () => {
  const paypalContainer = document.createElement('div');
  paypalContainer.id = 'paypal-button-container';
  paypalContainer.style.position = 'fixed';
  paypalContainer.style.top = '50%';
  paypalContainer.style.left = '50%';
  paypalContainer.style.transform = 'translate(-50%, -50%)';
  paypalContainer.style.zIndex = '9999';
  paypalContainer.style.backgroundColor = 'white';
  paypalContainer.style.padding = '20px';
  paypalContainer.style.borderRadius = '8px';
  paypalContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  overlay.style.zIndex = '9998';
  
  document.body.appendChild(overlay);
  document.body.appendChild(paypalContainer);

  return { paypalContainer, overlay };
};

export const cleanupPayPalContainer = (paypalContainer: HTMLElement, overlay: HTMLElement) => {
  if (document.body.contains(paypalContainer)) {
    document.body.removeChild(paypalContainer);
  }
  if (document.body.contains(overlay)) {
    document.body.removeChild(overlay);
  }
};
