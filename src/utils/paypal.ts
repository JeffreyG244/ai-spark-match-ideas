
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

  // Create payment options display
  const paymentOptionsContainer = document.createElement('div');
  paymentOptionsContainer.style.marginBottom = '20px';
  paymentOptionsContainer.style.textAlign = 'center';

  // PayPal and credit card logos
  const paymentLogos = document.createElement('div');
  paymentLogos.style.display = 'flex';
  paymentLogos.style.justifyContent = 'center';
  paymentLogos.style.alignItems = 'center';
  paymentLogos.style.gap = '10px';
  paymentLogos.style.marginBottom = '15px';
  paymentLogos.style.flexWrap = 'wrap';

  // PayPal logo
  const paypalLogo = document.createElement('img');
  paypalLogo.src = 'https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png';
  paypalLogo.alt = 'PayPal';
  paypalLogo.style.height = '25px';

  // Credit card logos
  const cardLogos = document.createElement('img');
  cardLogos.src = 'https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png';
  cardLogos.alt = 'Credit Cards Accepted';
  cardLogos.style.height = '25px';

  paymentLogos.appendChild(paypalLogo);
  paymentLogos.appendChild(cardLogos);

  // Payment methods text
  const paymentText = document.createElement('div');
  paymentText.innerHTML = `
    <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
      <strong>Accepted Payment Methods:</strong>
    </div>
    <div style="font-size: 12px; color: #888; line-height: 1.4;">
      • PayPal Account<br>
      • Visa, Mastercard, American Express<br>
      • Discover, JCB, UnionPay<br>
      • Debit Cards & Bank Transfers
    </div>
  `;

  paymentOptionsContainer.appendChild(paymentLogos);
  paymentOptionsContainer.appendChild(paymentText);

  // Create the main PayPal button
  const paypalButton = document.createElement('button');
  paypalButton.type = 'submit';
  paypalButton.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span>Continue to Payment</span>
    </div>
  `;
  paypalButton.style.backgroundColor = '#0070ba';
  paypalButton.style.color = 'white';
  paypalButton.style.border = 'none';
  paypalButton.style.padding = '14px 24px';
  paypalButton.style.borderRadius = '6px';
  paypalButton.style.fontSize = '16px';
  paypalButton.style.cursor = 'pointer';
  paypalButton.style.width = '100%';
  paypalButton.style.fontWeight = 'bold';
  paypalButton.style.transition = 'background-color 0.2s';

  // Add hover effect
  paypalButton.addEventListener('mouseenter', () => {
    paypalButton.style.backgroundColor = '#005ea6';
  });
  
  paypalButton.addEventListener('mouseleave', () => {
    paypalButton.style.backgroundColor = '#0070ba';
  });

  // Security notice
  const securityNotice = document.createElement('div');
  securityNotice.style.fontSize = '11px';
  securityNotice.style.color = '#999';
  securityNotice.style.marginTop = '15px';
  securityNotice.style.textAlign = 'center';
  securityNotice.innerHTML = '🔒 Secure payment processing powered by PayPal';

  // Assemble the form
  form.appendChild(cmdInput);
  form.appendChild(buttonIdInput);
  form.appendChild(paymentOptionsContainer);
  form.appendChild(paypalButton);
  form.appendChild(securityNotice);

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
