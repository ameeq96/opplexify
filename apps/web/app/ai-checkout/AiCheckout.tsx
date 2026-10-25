"use client";

import { useEffect, useState } from "react";

type Selection = {
  tool_id: string;
  tool_name: string;
  plan_id: string;
  plan_name: string;
  amount_minor: number;
  currency: "USD";
  duration: string;
  access: string;
  note: string;
  exp: number;
};

type Order = {
  publicToken: string;
  packageName: string;
  providerName: string;
  durationLabel: string | null;
  amountMinor: number;
  currency: string;
  status: string;
  paidAt: string | null;
  invoiceUrl: string | null;
};

type Props = { selection?: string; signature?: string; order?: string; merchantName: string };

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount / 100);
}

function Arrow() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function AiCheckout({ selection, signature, order, merchantName }: Props) {
  const [selected, setSelected] = useState<Selection | null>(null);
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSelected(null);
    setSavedOrder(null);
    setConfirmed(false);
    const load = async () => {
      try {
        if (order && !/^gai_[a-f0-9]{32}$/.test(order)) throw new Error("This order link is invalid. Please contact GetAI Tools for help.");
        if (!order && (!selection || !signature)) throw new Error("Choose a priced plan on GetAI Tools to open your secure checkout.");
        const endpoint = order
          ? `/public/ai-tools/orders/${encodeURIComponent(order)}`
          : `/public/ai-tools/selection?${new URLSearchParams({ selection: selection!, signature: signature! })}`;
        const response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } });
        const body = await response.json();
        if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Your checkout could not be loaded. Please reopen the plan on GetAI Tools.");
        if (order) {
          if (body.order?.publicToken !== order || body.order.currency !== "USD" || !Number.isSafeInteger(body.order.amountMinor) || body.order.amountMinor <= 0) throw new Error("The order details could not be verified. Please contact GetAI Tools.");
          setSavedOrder(body.order);
          setSelected(null);
        } else {
          if (body.currency !== "USD" || !Number.isSafeInteger(body.amount_minor) || body.amount_minor <= 0 || typeof body.tool_id !== "string" || !/^[a-z0-9-]+$/.test(body.tool_id)) throw new Error("The selected plan could not be verified. Please choose it again on GetAI Tools.");
          setSelected(body);
          setSavedOrder(null);
        }
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Checkout is temporarily unavailable. Please try again shortly.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [selection, signature, order, refresh]);

  async function continuePayment() {
    if (!selected || !confirmed || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/public/ai-tools/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ selection, signature })
      });
      const body = await response.json();
      if (typeof body.orderToken === "string" && /^gai_[a-f0-9]{32}$/.test(body.orderToken) && !body.checkoutUrl) {
        window.location.assign(`/ai-checkout?${new URLSearchParams({ order: body.orderToken })}`);
        return;
      }
      if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Payment could not be started. Please try again shortly.");
      const url = new URL(body.checkoutUrl);
      if (!["https://getsafepay.com", "https://sandbox.api.getsafepay.com"].includes(url.origin) || url.pathname !== "/embedded/" || url.username || url.password) throw new Error("The payment link could not be verified. Please contact GetAI Tools.");
      window.location.assign(url.toString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Payment is temporarily unavailable. Please try again shortly.");
      setSubmitting(false);
    }
  }

  const sourceUrl = selected ? `https://getaitools.shop/tools/${selected.tool_id}#tool-pricing` : "https://getaitools.shop/#tools";
  const paid = savedOrder?.status === "PAID";
  const ended = savedOrder?.status === "FAILED" || savedOrder?.status === "CANCELLED";
  const invoiceUrl = savedOrder && savedOrder.invoiceUrl === `/public/safepay/invoice/${savedOrder.publicToken}` ? savedOrder.invoiceUrl : null;

  return (
    <section className="gai-checkout" aria-labelledby="gai-title">
      <div className="gai-shell">
        <a className="gai-back" href={sourceUrl}>← Back to GetAI Tools</a>
        <div className="gai-heading"><p className="gai-eyebrow"><span /> GETAI TOOLS · SECURE CHECKOUT</p><h1 id="gai-title">{savedOrder ? paid ? "Payment confirmed." : "Your payment status." : "Your next AI upgrade."}</h1><p>{savedOrder ? "Your order details, all in one place." : "Review your plan. Keep the same price. Continue securely."}</p></div>

        {loading ? <div className="gai-state" role="status"><span className="gai-spinner" /> Verifying your {order ? "order" : "selected plan"}…</div> : null}
        {!loading && error && !selected && !savedOrder ? <div className="gai-state gai-error" role="alert"><h2>Let’s reopen your plan.</h2><p>{error}</p><a className="gai-button" href={sourceUrl}>Explore GetAI Tools <Arrow /></a></div> : null}

        {!loading && selected ? <div className="gai-grid">
          <article className="gai-card gai-plan"><div className="gai-card-label"><span>01 / YOUR SELECTED PLAN</span><span className="gai-tag">USD</span></div><h2>{selected.tool_name}</h2><p className="gai-plan-name">{selected.plan_name}</p><div className="gai-price">{money(selected.amount_minor)}<span>USD total</span></div><dl className="gai-details"><div><dt>Duration</dt><dd>{selected.duration}</dd></div><div><dt>Access</dt><dd>{selected.access}</dd></div></dl>{selected.note ? <div className="gai-note"><strong>Plan details</strong><p>{selected.note}</p></div> : null}<a className="gai-text-link" href={sourceUrl}>View original plan <Arrow /></a></article>
          <aside className="gai-card gai-payment"><div className="gai-card-label"><span>02 / REVIEW & CONTINUE</span><svg width="18" height="20" viewBox="0 0 20 22" fill="none" aria-hidden="true"><rect x="3" y="9" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M6 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" /></svg></div><h2>One plan. One clear total.</h2><dl className="gai-total"><div><dt>Selected plan</dt><dd>{money(selected.amount_minor)}</dd></div><div><dt>Total to pay <span>USD</span></dt><dd>{money(selected.amount_minor)}</dd></div></dl><p className="gai-payment-copy">This is the USD total listed on GetAI Tools. Your bank may apply its own currency conversion or fees.</p><label className="gai-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I have confirmed availability, access, activation and support/refund terms with GetAI Tools before paying.</span></label>{error ? <p className="gai-inline-error" role="alert">{error}</p> : null}<button className="gai-button" type="button" disabled={!confirmed || submitting} onClick={() => void continuePayment()}>{submitting ? "Opening secure payment…" : "Continue to SafePay"}<Arrow /></button><p className="gai-secure-note">One-time payment · Card details are entered on SafePay</p><div className="gai-merchant"><span>SERVICE PROVIDER & SAFEPAY MERCHANT</span><strong>{merchantName}</strong><p>For this GetAI Tools order, payment is made to the merchant named above.</p></div></aside>
        </div> : null}

        {!loading && savedOrder ? <article className="gai-card gai-order"><div className="gai-order-mark" aria-hidden="true">{paid ? "✓" : ended ? "!" : "…"}</div><p className="gai-eyebrow">{paid ? "VERIFIED PAYMENT" : ended ? "PAYMENT NOT CONFIRMED" : "AWAITING CONFIRMATION"}</p><h2>{paid ? "You’re all set." : ended ? "Check before paying again." : "We’re checking your payment."}</h2><p>{paid ? "SafePay has verified your payment. Contact GetAI Tools with the reference below for access and activation." : "This order has not been verified as paid. If your bank shows a debit, do not pay again; refresh the status or contact GetAI Tools."}</p><dl className="gai-details"><div><dt>Plan</dt><dd>{savedOrder.packageName}</dd></div>{savedOrder.durationLabel ? <div><dt>Duration</dt><dd>{savedOrder.durationLabel}</dd></div> : null}<div><dt>Total</dt><dd>{money(savedOrder.amountMinor)} USD</dd></div><div><dt>Order reference</dt><dd className="gai-reference">{savedOrder.publicToken}</dd></div></dl><div className="gai-order-actions">{paid && invoiceUrl ? <a className="gai-button" href={invoiceUrl}>Download paid invoice <Arrow /></a> : <button className="gai-button" type="button" onClick={() => setRefresh((value) => value + 1)}>Refresh payment status <Arrow /></button>}<a className="gai-text-link" href={`https://wa.me/923008092395?text=${encodeURIComponent(`Hi GetAI Tools, please help with my order ${savedOrder.publicToken}. Plan: ${savedOrder.packageName}. Total: ${money(savedOrder.amountMinor)} USD.`)}`} target="_blank" rel="noopener noreferrer">Contact GetAI Tools <Arrow /></a></div>{error ? <p className="gai-inline-error" role="alert">{error}</p> : null}</article> : null}

        <p className="gai-footer-note">Questions before paying? <a href="https://wa.me/923008092395" target="_blank" rel="noopener noreferrer">Talk to GetAI Tools</a><span>Hosted on Opplexify · Payment through SafePay</span></p>
      </div>
      <style>{`
        .gai-checkout{background:#101314;color:#f5f5f0;min-height:75vh;padding:152px 24px 90px;font-family:inherit}.gai-checkout *{box-sizing:border-box}.gai-shell{max-width:1120px;margin:0 auto}.gai-back{color:#aeb6b2;font-size:14px;text-decoration:none;display:inline-block;margin-bottom:38px}.gai-back:hover,.gai-text-link:hover{color:#c9f26d}.gai-heading{margin-bottom:38px}.gai-eyebrow{font-size:11px!important;letter-spacing:1.7px;font-weight:600;color:#c9f26d!important;display:flex;align-items:center;gap:9px;margin:0 0 16px!important}.gai-eyebrow>span{width:7px;height:7px;border-radius:50%;background:#c9f26d}.gai-heading h1{font-size:clamp(34px,5vw,58px);line-height:1.1;letter-spacing:-2px;font-weight:500;color:inherit;margin:0 0 16px}.gai-heading>p:last-child{color:#a6b0aa;font-size:16px;line-height:1.6;margin:0}.gai-grid{display:grid;grid-template-columns:1.13fr 1fr;gap:22px;align-items:start}.gai-card{border:1px solid #333c36;background:#191f1b;border-radius:20px;padding:32px}.gai-card-label{display:flex;justify-content:space-between;align-items:center;color:#a3afa6;font-size:10px;font-weight:500;letter-spacing:1.5px;min-height:26px;margin-bottom:29px}.gai-tag{border:1px solid #52683c;border-radius:6px;padding:4px 7px;line-height:1.1;color:#c9f26d;font-size:10px;letter-spacing:1px}.gai-plan h2{font-size:32px;line-height:1.15;letter-spacing:-.7px;font-weight:500;color:inherit;margin:0 0 10px}.gai-plan-name{font-size:15px;line-height:1.6;color:#b9c2bb;margin:0;overflow-wrap:anywhere}.gai-price{font-size:58px;line-height:1;letter-spacing:-2.5px;font-weight:500;color:#d5f59b;padding:32px 0}.gai-price>span{font-size:12px;color:#9eada2;letter-spacing:0;display:block;margin-top:12px;font-weight:400}.gai-details{border-top:1px solid #344035;margin:0}.gai-details>div{display:grid;grid-template-columns:92px 1fr;gap:16px;padding:17px 0;border-bottom:1px solid #344035;font-size:13px;line-height:1.65}.gai-details dt{color:#97a69b;font-weight:400}.gai-details dd{color:#e1e8e0;margin:0;overflow-wrap:anywhere}.gai-note{padding:19px;background:#222b21;border:1px solid #3a4730;border-radius:10px;margin-top:24px;font-size:12px;line-height:1.7}.gai-note strong{display:block;color:#d3e3c0;font-size:12px;font-weight:500;margin-bottom:6px}.gai-note p{margin:0;color:#aebda5;font-size:12px;line-height:1.7;overflow-wrap:anywhere}.gai-text-link{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-size:13px;color:#d9e6ce;text-decoration:none;line-height:1.5}.gai-plan>.gai-text-link{margin-top:23px}.gai-payment{background:#20271f}.gai-payment h2{font-size:23px;line-height:1.3;letter-spacing:-.6px;color:inherit;font-weight:500;margin:0 0 29px}.gai-total{margin:0 0 16px}.gai-total>div{display:flex;justify-content:space-between;align-items:center;gap:14px;font-size:13px;margin-bottom:19px;color:#b4c0b1}.gai-total dt{font-weight:400}.gai-total dd{margin:0;color:#e5eede;font-size:16px}.gai-total>div:last-child{border-top:1px solid #43513a;padding-top:23px;margin:0;color:#f3f6ec}.gai-total>div:last-child dt{font-size:15px}.gai-total dt span{font-size:10px;color:#a3b197;display:block;margin-top:5px}.gai-total>div:last-child dd{font-size:30px;letter-spacing:-.6px}.gai-payment-copy{font-size:11px;line-height:1.7;color:#a7b39e;margin:0 0 25px}.gai-confirm{display:flex;align-items:start;gap:11px;font-size:12px;line-height:1.7;color:#c1cdb8;margin-bottom:22px;cursor:pointer}.gai-confirm input{accent-color:#c9f26d;width:16px;height:16px;min-width:16px;margin-top:3px}.gai-button{display:flex;align-items:center;justify-content:space-between;gap:17px;width:100%;border:1px solid #c9f26d;background:#c9f26d;color:#1a2115!important;text-decoration:none;padding:17px 20px;min-height:55px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.4;cursor:pointer;transition:background .15s}.gai-button:hover{background:#d8ff8c}.gai-button:disabled{opacity:.45;cursor:not-allowed}.gai-button:focus-visible,.gai-text-link:focus-visible,.gai-back:focus-visible,.gai-confirm input:focus-visible{outline:2px solid #d8ff8c;outline-offset:4px}.gai-secure-note{font-size:10px;line-height:1.6;text-align:center;color:#a7b49d;margin:12px 0 24px}.gai-merchant{border-top:1px solid #43513a;padding-top:23px}.gai-merchant>span{font-size:9px;letter-spacing:1px;display:block;color:#9eae94;margin-bottom:9px;line-height:1.7}.gai-merchant>strong{font-size:13px;font-weight:500;color:#e0ead9}.gai-merchant>p{font-size:11px;line-height:1.7;color:#a7b39e;margin:8px 0 0}.gai-footer-note{font-size:12px;line-height:1.8;color:#9ba79e;text-align:center;margin:28px 0 0}.gai-footer-note a{color:#dae6d3;text-underline-offset:3px}.gai-footer-note>span{display:block;color:#6d7c70;font-size:10px;letter-spacing:.3px;margin-top:4px}.gai-state{border:1px solid #384633;border-radius:16px;background:#191f1b;padding:45px;display:flex;align-items:center;justify-content:center;gap:15px;font-size:14px;color:#becab8;min-height:200px}.gai-spinner{height:19px;width:19px;border:2px solid #46553c;border-top-color:#c9f26d;border-radius:50%;animation:gai-spin .8s linear infinite}@keyframes gai-spin{to{transform:rotate(360deg)}}.gai-error{display:block;max-width:620px}.gai-error h2{font-size:25px;color:#f5f5f0;font-weight:500;margin:0 0 13px}.gai-error p{font-size:14px;color:#b3c0ac;line-height:1.8;margin:0 0 25px}.gai-error .gai-button{max-width:280px}.gai-inline-error{font-size:12px;line-height:1.6;background:#3d2824;border:1px solid #75493d;color:#ffd5c3;padding:13px 15px;border-radius:7px;margin:0 0 18px}.gai-order{max-width:700px;margin:0 auto}.gai-order-mark{width:52px;height:52px;border:1px solid #658043;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:25px;color:#c9f26d;margin-bottom:23px}.gai-order h2{font-size:30px;letter-spacing:-.8px;color:inherit;font-weight:500;margin:0 0 13px}.gai-order>p:not(.gai-eyebrow){font-size:14px;line-height:1.8;color:#acbba7;margin:0 0 26px}.gai-reference{font-family:monospace;font-size:11px}.gai-order-actions{display:flex;flex-direction:column;gap:21px;padding-top:27px}.gai-order-actions .gai-button{max-width:360px}.gai-order-actions .gai-text-link{align-self:start}@media(max-width:760px){.gai-checkout{padding:120px 18px 60px}.gai-back{margin-bottom:30px}.gai-heading{margin-bottom:27px}.gai-heading h1{letter-spacing:-1.2px}.gai-heading>p:last-child{font-size:14px}.gai-grid{grid-template-columns:1fr;gap:17px}.gai-card{padding:25px 23px;border-radius:15px}.gai-card-label{margin-bottom:23px}.gai-price{font-size:52px;padding:26px 0}.gai-state{padding:30px 24px}.gai-details>div{grid-template-columns:75px 1fr;gap:12px}.gai-order h2{font-size:27px}.gai-order-actions .gai-button{max-width:none}}@media(prefers-reduced-motion:reduce){.gai-spinner{animation:none}.gai-button{transition:none}}
      `}</style>
    </section>
  );
}
