-- Poketo payment persistence for ASRIVA TRAVEL.
-- Orders are written by trusted Edge Functions only; browser roles have no table access.

create table if not exists public.asriva_orders (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null unique check (booking_ref ~ '^[A-Z0-9._:-]{1,64}$'),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED')),
  amount integer not null check (amount >= 10000),
  currency text not null default 'IDR' check (currency = 'IDR'),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  order_data jsonb not null default '{}'::jsonb,
  poketo_invoice_id text unique,
  poketo_payment_url text,
  poketo_environment text not null default 'sandbox' check (poketo_environment = 'sandbox'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.asriva_poketo_events (
  event_id text primary key,
  event_type text not null,
  invoice_id text,
  reference_id text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

alter table public.asriva_orders enable row level security;
alter table public.asriva_poketo_events enable row level security;

revoke all on public.asriva_orders from anon, authenticated;
revoke all on public.asriva_poketo_events from anon, authenticated;
grant all on public.asriva_orders to service_role;
grant all on public.asriva_poketo_events to service_role;

-- Atomic event deduplication + order transition. Only service_role can execute it.
create or replace function public.process_asriva_poketo_event(
  p_event_id text,
  p_event_type text,
  p_reference_id text,
  p_invoice_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inserted_event_id text;
  v_updated_count integer := 0;
begin
  insert into public.asriva_poketo_events(event_id, event_type, invoice_id, reference_id, payload)
  values (p_event_id, p_event_type, p_invoice_id, p_reference_id, p_payload)
  on conflict (event_id) do nothing
  returning event_id into v_inserted_event_id;

  if v_inserted_event_id is null then
    return jsonb_build_object('duplicate', true, 'updated', false);
  end if;

  if p_event_type = 'invoice.paid' then
    update public.asriva_orders
       set status = 'PAID',
           poketo_invoice_id = coalesce(poketo_invoice_id, p_invoice_id),
           paid_at = coalesce(paid_at, now()),
           updated_at = now()
     where booking_ref = p_reference_id
       and status in ('PENDING', 'EXPIRED', 'CANCELLED')
       and (poketo_invoice_id is null or poketo_invoice_id = p_invoice_id);
    get diagnostics v_updated_count = row_count;
  elsif p_event_type = 'invoice.expired' then
    update public.asriva_orders
       set status = 'EXPIRED', poketo_invoice_id = coalesce(poketo_invoice_id, p_invoice_id), updated_at = now()
     where booking_ref = p_reference_id and status = 'PENDING'
       and (poketo_invoice_id is null or poketo_invoice_id = p_invoice_id);
    get diagnostics v_updated_count = row_count;
  elsif p_event_type = 'invoice.cancelled' then
    update public.asriva_orders
       set status = 'CANCELLED', poketo_invoice_id = coalesce(poketo_invoice_id, p_invoice_id), updated_at = now()
     where booking_ref = p_reference_id and status = 'PENDING'
       and (poketo_invoice_id is null or poketo_invoice_id = p_invoice_id);
    get diagnostics v_updated_count = row_count;
  elsif p_event_type = 'invoice.refunded' then
    update public.asriva_orders
       set status = 'REFUNDED', updated_at = now()
     where booking_ref = p_reference_id and poketo_invoice_id = p_invoice_id and status = 'PAID';
    get diagnostics v_updated_count = row_count;
  end if;

  return jsonb_build_object('duplicate', false, 'updated', v_updated_count > 0);
end;
$$;

revoke all on function public.process_asriva_poketo_event(text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.process_asriva_poketo_event(text, text, text, text, jsonb) to service_role;
