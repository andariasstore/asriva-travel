create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  environment text not null check (environment in ('sandbox', 'live')),
  reference_id text not null check (reference_id ~ '^[A-Za-z0-9._:-]{1,64}$'),
  poketo_invoice_id text,
  creation_state text not null default 'creating' check (creation_state in ('creating', 'created', 'failed', 'unknown')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled', 'refunded')),
  amount bigint not null check (amount >= 10000),
  currency text not null default 'IDR',
  title text,
  description text,
  merchant_name text,
  customer jsonb,
  items jsonb,
  fees jsonb,
  total_amount bigint,
  payment_method text,
  payment_url text,
  redirect_url text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  refunded_at timestamptz,
  request_payload jsonb not null,
  provider_payload jsonb,
  processed_webhook_event_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(processed_webhook_event_ids) = 'array'),
  last_webhook_event_id text,
  last_webhook_event_type text,
  last_webhook_payload jsonb,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_environment_reference_id_key unique (environment, reference_id)
);

create unique index invoices_environment_poketo_invoice_id_key
  on public.invoices (environment, poketo_invoice_id)
  where poketo_invoice_id is not null;

create index invoices_status_created_at_idx on public.invoices (status, created_at desc);

alter table public.invoices enable row level security;
revoke all on table public.invoices from anon, authenticated;
grant all on table public.invoices to service_role;

create or replace function public.process_poketo_webhook(
  p_event_id text, p_event_type text, p_environment text,
  p_reference_id text, p_invoice_id text, p_payload jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $function$
declare
  v_row public.invoices%rowtype;
begin
  if p_event_id is null or length(trim(p_event_id)) = 0
     or p_reference_id is null or length(trim(p_reference_id)) = 0
     or p_invoice_id is null or length(trim(p_invoice_id)) = 0
     or p_environment not in ('sandbox', 'live')
     or p_event_type not in ('invoice.paid', 'invoice.expired', 'invoice.cancelled', 'invoice.refunded') then
    raise exception 'invalid webhook arguments';
  end if;

  update public.invoices as i
  set
    poketo_invoice_id = coalesce(i.poketo_invoice_id, p_invoice_id),
    status = case
      when p_event_type = 'invoice.paid' and i.status <> 'refunded' then 'paid'
      when p_event_type = 'invoice.refunded' then 'refunded'
      when p_event_type = 'invoice.expired' and i.status = 'pending' then 'expired'
      when p_event_type = 'invoice.cancelled' and i.status = 'pending' then 'cancelled'
      else i.status
    end,
    paid_at = case
      when p_event_type = 'invoice.paid' then coalesce(nullif(p_payload #>> '{data,paidAt}', '')::timestamptz, i.paid_at, now())
      else i.paid_at
    end,
    refunded_at = case
      when p_event_type = 'invoice.refunded' then coalesce(nullif(p_payload #>> '{data,refundedAt}', '')::timestamptz, i.refunded_at, now())
      else i.refunded_at
    end,
    fees = coalesce(p_payload #> '{data,fees}', i.fees),
    total_amount = coalesce(nullif(p_payload #>> '{data,totalAmount}', '')::bigint, i.total_amount),
    payment_method = coalesce(p_payload #>> '{data,paymentMethod}', i.payment_method),
    provider_payload = coalesce(p_payload -> 'data', i.provider_payload),
    processed_webhook_event_ids = i.processed_webhook_event_ids || jsonb_build_array(p_event_id),
    last_webhook_event_id = p_event_id,
    last_webhook_event_type = p_event_type,
    last_webhook_payload = p_payload,
    updated_at = now()
  where i.environment = p_environment
    and i.reference_id = p_reference_id
    and (i.poketo_invoice_id is null or i.poketo_invoice_id = p_invoice_id)
    and not (i.processed_webhook_event_ids @> jsonb_build_array(p_event_id))
  returning i.* into v_row;

  if found then
    return jsonb_build_object('duplicate', false, 'updated', true, 'status', v_row.status);
  end if;

  select * into v_row from public.invoices
  where environment = p_environment and reference_id = p_reference_id;

  if not found then return jsonb_build_object('notFound', true); end if;
  if v_row.poketo_invoice_id is not null and v_row.poketo_invoice_id <> p_invoice_id then
    return jsonb_build_object('invoiceMismatch', true);
  end if;
  if v_row.processed_webhook_event_ids @> jsonb_build_array(p_event_id) then
    return jsonb_build_object('duplicate', true, 'updated', false, 'status', v_row.status);
  end if;
  return jsonb_build_object('updated', false, 'status', v_row.status);
end;
$function$;

revoke all on function public.process_poketo_webhook(text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.process_poketo_webhook(text, text, text, text, text, jsonb) to service_role;

drop function if exists public.process_asriva_poketo_event(text, text, text, text, jsonb);
drop table if exists public.asriva_poketo_events;
drop table if exists public.asriva_orders;
