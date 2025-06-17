
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

  // Required hidden inputs for hosted button
  const cmdInput = document.createElement('input');
  cmdInput.type = 'hidden';
  cmdInput.name = 'cmd';
  cmdInput.value = '_s-xclick';

  const buttonIdInput = document.createElement('input');
  buttonIdInput.type = 'hidden';
  buttonIdInput.name = 'hosted_button_id';
  buttonIdInput.value = hostedButtonId;

  // Create the submit button
  const submitButton = document.createElement('input');
  submitButton.type = 'image';
  submitButton.src = 'https://www.paypalobjects.com/en_US/i/btn/btn_subscribeCC_LG.gif';
  submitButton.name = 'submit';
  submitButton.alt = 'PayPal - The safer, easier way to pay online!';
  submitButton.style.border = '0';
  submitButton.style.cursor = 'pointer';

  // Add a fallback text button
  const textButton = document.createElement('button');
  textButton.type = 'submit';
  textButton.textContent = 'Subscribe with PayPal';
  textButton.style.backgroundColor = '#0070ba';
  textButton.style.color = 'white';
  textButton.style.border = 'none';
  textButton.style.padding = '12px 24px';
  textButton.style.borderRadius = '6px';
  textButton.style.fontSize = '16px';
  textButton.style.cursor = 'pointer';
  textButton.style.marginTop = '10px';
  textButton.style.display = 'block';
  textButton.style.width = '100%';

  // Assemble the form
  form.appendChild(cmdInput);
  form.appendChild(buttonIdInput);
  form.appendChild(submitButton);
  form.appendChild(textButton);

  // Clear container and add form
  container.innerHTML = '';
  container.appendChild(form);

  console.log('PayPal hosted button created successfully');
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
