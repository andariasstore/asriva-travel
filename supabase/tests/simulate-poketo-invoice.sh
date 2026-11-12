#!/usr/bin/env bash
set -euo pipefail

: "${POKETO_SECRET_KEY:?Set POKETO_SECRET_KEY to a Poketo sandbox key (sk_test_...)}"
: "${POKETO_INVOICE_ID:?Set POKETO_INVOICE_ID to the invoice ID returned by poketo-create-invoice}"

if [[ "${POKETO_SECRET_KEY}" != sk_test_* ]]; then
  echo "Refusing to simulate: POKETO_SECRET_KEY must start with sk_test_." >&2
  exit 1
fi

curl --fail-with-body --silent --show-error \
  --request POST "https://poketo.id/api/v1/invoices/${POKETO_INVOICE_ID}/simulate" \
  --header "Authorization: Bearer ${POKETO_SECRET_KEY}" \
  --header "Content-Type: application/json" \
  --data '{"result":"paid","paymentMethod":"QRIS"}'
printf '\n'
