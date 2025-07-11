const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Security middleware
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    console.log('❌ Missing signature header');
    return res.status(403).send('No signature provided');
  }

  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  
  if (signature !== digest) {
    console.log('❌ Invalid signature:', {
      received: signature,
      expected: digest
    });
    return res.status(401).send('Invalid signature');
  }

  next();
};

// Webhook endpoint
router.post('/', express.json(), verifySignature, (req, res) => {
  console.log('✅ Verified Webhook:', {
    event: req.headers['x-github-event'],
    delivery: req.headers['x-github-delivery']
  });
  
  res.status(200).send('Webhook securely processed');
});

module.exports = router;
