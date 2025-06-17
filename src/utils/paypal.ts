
declare global {
  interface Window {
    paypal: any;
  }
}

export const loadPayPalScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // For hosted buttons, we don't need the PayPal SDK at all
    // We'll create a simple form that submits to PayPal directly
    console.log('PayPal hosted button setup - no SDK required');
    resolve();
  });
};

export const createPayPalHostedButton = (containerId: string, hostedButtonId: string) => {
  const container = document.querySelector(`#${containerId}`);
  if (!container) {
    throw new Error(`Container with ID ${containerId} not found`);
  }

  // Create a form that directly submits to PayPal
  const form = document.createElement('form');
  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.method = 'post';
  form.target = '_top';
  form.style.textAlign = 'center';
  form.style.width = '100%';

  // Required hidden inputs for hosted button
  const cmdInput = document.createElement('input');
  cmdInput.type = 'hidden';
  cmdInput.name = 'cmd';
  cmdInput.value = '_s-xclick';

  const buttonIdInput = document.createElement('input');
  buttonIdInput.type = 'hidden';
  buttonIdInput.name = 'hosted_button_id';
  buttonIdInput.value = hostedButtonId;

  // Create the PayPal button that actually works
  const paypalButton = document.createElement('button');
  paypalButton.type = 'submit';
  paypalButton.innerHTML = 'Subscribe with PayPal';
  paypalButton.style.backgroundColor = '#0070ba';
  paypalButton.style.color = 'white';
  paypalButton.style.border = 'none';
  paypalButton.style.padding = '12px 24px';
  paypalButton.style.borderRadius = '6px';
  paypalButton.style.fontSize = '16px';
  paypalButton.style.cursor = 'pointer';
  paypalButton.style.width = '100%';
  paypalButton.style.fontWeight = 'bold';

  // Add hover effect
  paypalButton.addEventListener('mouseenter', () => {
    paypalButton.style.backgroundColor = '#005ea6';
  });
  
  paypalButton.addEventListener('mouseleave', () => {
    paypalButton.style.backgroundColor = '#0070ba';
  });

  // Assemble the form
  form.appendChild(cmdInput);
  form.appendChild(buttonIdInput);
  form.appendChild(paypalButton);

  // Clear container and add form
  container.innerHTML = '';
  container.appendChild(form);

  console.log('PayPal hosted button created successfully with button ID:', hostedButtonId);
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
  paypalContainer.style.padding = '30px';
  paypalContainer.style.borderRadius = '12px';
  paypalContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
  paypalContainer.style.maxWidth = '400px';
  paypalContainer.style.width = '90%';
  paypalContainer.style.position = 'relative';
  
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  overlay.style.zIndex = '9998';
  
  // Make overlay clickable to close
  overlay.addEventListener('click', () => {
    cleanupPayPalContainer(paypalContainer, overlay);
  });
  
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
