# Airtel Money UAT configuration checklist

Use this checklist before enabling an Airtel Money collection request in NWUCHAS.
It deliberately fails closed: NWUCHAS will not invent credentials, tokens,
transaction IDs, or a successful payment response.

## 1. Airtel onboarding

- Register NWUCHAS on the Airtel Africa Developer Portal and select **Zambia**.
- Create an application and request the **Collection** product for UAT.
- Complete merchant/KYC onboarding and record the UAT settlement arrangement.
- Obtain from Airtel, in writing:
  - UAT API base URL;
  - OAuth client ID and client secret;
  - test-wallet MSISDN(s) and the UAT authorisation procedure;
  - accepted transaction-status endpoint and response fields;
  - callback URL registration procedure and the exact callback authentication method;
  - the merchant/partner identifier, if their Zambia product requires one.

Do not use a personal wallet as an automated test target until Airtel confirms
that it is an approved UAT wallet. A sandbox normally uses provider-issued test
wallets and does not debit real funds.

## 2. Public UAT endpoint

- Deploy NWUCHAS to a non-production UAT domain with valid HTTPS.
- Set the callback URL with Airtel to:

  `https://<uat-domain>/api/payments/webhook`

- Do not use localhost, a private IP address, or a tunnel that changes address.
- Restrict inbound callback traffic to Airtel's documented source ranges if they
  provide them, but do not rely on IP filtering alone.

## 3. Secrets and environment

Add the following to the UAT deployment secret store (not Git, client-side
configuration, logs, screenshots, or support tickets):

```dotenv
AIRTEL_MONEY_API_URL=https://<Airtel-provided-UAT-host>
AIRTEL_MONEY_CLIENT_ID=<Airtel-issued-client-id>
AIRTEL_MONEY_CLIENT_SECRET=<Airtel-issued-client-secret>
AIRTEL_MONEY_COUNTRY=ZM
AIRTEL_MONEY_CURRENCY=ZMW
NEXT_PUBLIC_APP_URL=https://<public-uat-nwuchas-domain>
```

Only add this next variable if Airtel confirms that its callback is signed as an
HMAC-SHA256 of the raw body and supplies the shared secret:

```dotenv
AIRTEL_MONEY_WEBHOOK_SECRET=<Airtel-issued-shared-secret>
```

The current callback rejects an Airtel callback without a valid HMAC signature.
If Airtel uses mTLS, JWT, a public-key signature, or another scheme, do not
weaken that check. Update the handler to Airtel's documented scheme first.

## 4. NWUCHAS behaviour to verify

- The payer chooses **Airtel Money** explicitly; NWUCHAS does not infer a
  carrier from the MSISDN prefix because numbers can be ported.
- Enter the number as either `0XXXXXXXXX`, `XXXXXXXXX`, or `+260XXXXXXXXX`.
  NWUCHAS stores it as `260XXXXXXXXX` for the provider request.
- Create a test invoice for ZMW 1.00 and initiate one Airtel collection.
- Confirm the UAT prompt using only the provider's approved test mechanism.
- Confirm that the provider's transaction ID, NWUCHAS payment intent, ledger
  posting, receipt, and invoice balance all agree.
- Re-send the same callback and verify it cannot create a second payment.
- Test declined authorisation, expiry, invalid wallet, timeout, provider error,
  wrong amount, and callback-signature failure.

## 5. Production gate

Do not promote until Airtel has approved UAT evidence, the webhook authentication
has been independently checked, and finance has reconciled the UAT ledger. Use
separate production credentials, a separate production callback URL, and a
small controlled live transaction before making the payment option available to
all students and parents.
