"use client";

import { useEffect, useRef } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import styles from "../../streaming-plans.module.css";

const whatsappUrl = "https://wa.me/923054136663?text=" + encodeURIComponent(
  "Hi, my payment for Digital Services has been confirmed. I would like to share the payment screenshot for my order."
);

export function PaymentWhatsAppPrompt({ getaiMessage }: { getaiMessage?: string } = {}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  function closePrompt() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.secondaryLink}
        onClick={() => dialogRef.current?.showModal()}>
        Send screenshot on WhatsApp
      </button>
      <dialog ref={dialogRef} className={styles.whatsappPrompt}
        aria-labelledby="payment-whatsapp-title" aria-describedby="payment-whatsapp-description"
        onClose={() => triggerRef.current?.focus()}>
        <button type="button" className={styles.whatsappClose} onClick={closePrompt}
          aria-label="Close payment reminder" autoFocus>
          <X size={20} aria-hidden="true" />
        </button>
        <span className={styles.whatsappSuccess} aria-hidden="true"><Check size={30} /></span>
        <p className={styles.whatsappEyebrow}>Payment confirmed</p>
        <h2 id="payment-whatsapp-title">One quick step: send your screenshot</h2>
        <p id="payment-whatsapp-description" className={styles.whatsappDescription}>
          {getaiMessage ? "Your GetAI Tools payment was successful. Please share your payment screenshot with GetAI Tools on WhatsApp." : "Your payment for Digital Services was successful. Please share your payment screenshot with our support team on WhatsApp."}
        </p>
        <p className={styles.whatsappHint}>
          Open WhatsApp, attach your screenshot, then tap send. Hide card details, passwords and any OTPs before sharing.
        </p>
        <div className={styles.whatsappActions}>
          <a className={styles.whatsappButton} href={getaiMessage ? `https://wa.me/923008092395?text=${encodeURIComponent(getaiMessage)}` : whatsappUrl} target="_blank"
            rel="noopener noreferrer" onClick={closePrompt}>
            <MessageCircle size={20} aria-hidden="true" /> Open WhatsApp
          </a>
          <button type="button" className={styles.secondaryLink} onClick={closePrompt}>Not now</button>
        </div>
        <p className={styles.whatsappFootnote}>
          This reminder does not change your payment status. Your invoice is available on this page.
        </p>
      </dialog>
    </>
  );
}
