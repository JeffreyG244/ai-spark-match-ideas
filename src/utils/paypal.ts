
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

  // Clear container first
  container.innerHTML = '';

  // Create payment options display FIRST
  const paymentOptionsContainer = document.createElement('div');
  paymentOptionsContainer.style.marginBottom = '25px';
  paymentOptionsContainer.style.textAlign = 'center';
  paymentOptionsContainer.style.padding = '0 10px';

  // Header text
  const headerText = document.createElement('div');
  headerText.innerHTML = '<div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px;">Choose Your Payment Method</div>';
  
  // PayPal and credit card logos
  const paymentLogos = document.createElement('div');
  paymentLogos.style.display = 'flex';
  paymentLogos.style.justifyContent = 'center';
  paymentLogos.style.alignItems = 'center';
  paymentLogos.style.gap = '15px';
  paymentLogos.style.marginBottom = '15px';
  paymentLogos.style.flexWrap = 'wrap';

  // PayPal logo
  const paypalLogo = document.createElement('img');
  paypalLogo.src = 'https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png';
  paypalLogo.alt = 'PayPal';
  paypalLogo.style.height = '30px';
  paypalLogo.style.maxWidth = '100px';

  // Credit card logos
  const cardLogos = document.createElement('img');
  cardLogos.src = 'https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png';
  cardLogos.alt = 'Credit Cards Accepted';
  cardLogos.style.height = '30px';
  cardLogos.style.maxWidth = '200px';

  paymentLogos.appendChild(paypalLogo);
  paymentLogos.appendChild(cardLogos);

  // Payment methods text
  const paymentText = document.createElement('div');
  paymentText.innerHTML = `
    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
      <strong>We Accept:</strong>
    </div>
    <div style="font-size: 12px; color: #888; line-height: 1.5;">
      ✓ PayPal Account<br>
      ✓ Visa, Mastercard, American Express<br>
      ✓ Discover, JCB, UnionPay<br>
      ✓ Debit Cards & Bank Transfers (where available)
    </div>
  `;

  // Assemble payment options
  paymentOptionsContainer.appendChild(headerText);
  paymentOptionsContainer.appendChild(paymentLogos);
  paymentOptionsContainer.appendChild(paymentText);

  // Add payment options to container
  container.appendChild(paymentOptionsContainer);

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

  // Create the main PayPal button as an input submit button instead of regular button
  const paypalButton = document.createElement('input');
  paypalButton.type = 'submit';
  paypalButton.value = 'Continue to PayPal Checkout';
  paypalButton.style.backgroundColor = '#0070ba';
  paypalButton.style.color = 'white';
  paypalButton.style.border = 'none';
  paypalButton.style.padding = '16px 32px';
  paypalButton.style.borderRadius = '8px';
  paypalButton.style.fontSize = '16px';
  paypalButton.style.fontWeight = 'bold';
  paypalButton.style.cursor = 'pointer';
  paypalButton.style.width = '100%';
  paypalButton.style.transition = 'all 0.2s ease';
  paypalButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

  // Add hover and active effects
  paypalButton.addEventListener('mouseenter', () => {
    paypalButton.style.backgroundColor = '#005ea6';
    paypalButton.style.transform = 'translateY(-1px)';
    paypalButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });
  
  paypalButton.addEventListener('mouseleave', () => {
    paypalButton.style.backgroundColor = '#0070ba';
    paypalButton.style.transform = 'translateY(0)';
    paypalButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  paypalButton.addEventListener('mousedown', () => {
    paypalButton.style.transform = 'translateY(1px)';
  });

  paypalButton.addEventListener('mouseup', () => {
    paypalButton.style.transform = 'translateY(-1px)';
  });

  // Add form submit event listener for debugging
  form.addEventListener('submit', function(e) {
    console.log('PayPal form submitting to:', form.action);
    console.log('Form method:', form.method);
    console.log('Form target:', form.target);
    console.log('Button ID:', hostedButtonId);
    console.log('Form data:', new FormData(form));
    
    // Don't prevent default - let it submit naturally
    console.log('Form submission proceeding...');
  });

  // Security notice
  const securityNotice = document.createElement('div');
  securityNotice.style.fontSize = '11px';
  securityNotice.style.color = '#999';
  securityNotice.style.marginTop = '20px';
  securityNotice.style.textAlign = 'center';
  securityNotice.style.fontStyle = 'italic';
  securityNotice.innerHTML = '🔒 Secure 256-bit SSL encryption powered by PayPal';

  // Assemble the form
  form.appendChild(cmdInput);
  form.appendChild(buttonIdInput);
  form.appendChild(paypalButton);
  form.appendChild(securityNotice);

  // Add form to container
  container.appendChild(form);

  console.log('PayPal hosted button created successfully with button ID:', hostedButtonId);
  console.log('Form action:', form.action);
  console.log('Form method:', form.method);
  console.log('Form target:', form.target);
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
