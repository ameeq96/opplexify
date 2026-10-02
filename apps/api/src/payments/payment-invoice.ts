import { resolve } from "node:path";
import PDFDocument from "pdfkit";
import { BUSINESS_IDENTITY } from "@adon/shared";

type PaymentInvoice = {
  id: string;
  packageType: string;
  packageName: string;
  providerName: string;
  durationLabel: string | null;
  amountMinor: number;
  currency: string;
  paidAt: Date;
};

export function createPaymentInvoice(order: PaymentInvoice): Promise<Buffer> {
  return new Promise((resolvePdf, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      info: {
        Title: `Paid invoice OPX-${order.id}`,
        Author: BUSINESS_IDENTITY.freelancer.legalName,
        Subject: "Receipt for a verified SafePay payment",
        CreationDate: order.paidAt
      }
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolvePdf(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      const assets = resolve(__dirname, "../../../web/public/template-assets/dark/assets");
      doc.registerFont("Body", resolve(assets, "fonts/BDOGrotesk-Regular.ttf"));
      doc.registerFont("Heading", resolve(assets, "fonts/BDOGrotesk-DemiBold.ttf"));
      const text = (value: string) => value.replace(/[\x00-\x1f\x7f]/g, " ").slice(0, 500);
      const money = (minor: number) => `${order.currency.toUpperCase()} ${(minor / 100).toFixed(2)}`;
      const test = order.packageType === "test_payment";
      const right = doc.page.width - 48;
      const width = right - 48;
      const ink = "#162335";
      const muted = "#536278";

      doc.rect(0, 0, doc.page.width, 130).fill("#152331");
      doc.image(resolve(assets, "imgs/logo/opplexify-logo-full-v2.png"), 48, 31, { fit: [182, 68] });
      doc.font("Heading").fontSize(25).fillColor("#ffffff").text("PAID INVOICE", 300, 43, { width: right - 300, align: "right" });
      doc.font("Body").fontSize(10).fillColor("#b8d9f5").text("Payment confirmed via SafePay", 295, 82, { width: right - 295, align: "right" });

      doc.font("Heading").fontSize(9).fillColor(muted).text("ISSUED BY", 48, 159);
      doc.fontSize(15).fillColor(ink).text(BUSINESS_IDENTITY.freelancer.legalName, 48, 178);
      doc.font("Body").fontSize(10).fillColor(muted).text(BUSINESS_IDENTITY.freelancer.contact.phone, 48, 205);
      doc.text(BUSINESS_IDENTITY.brand.websiteUrl, 48, doc.y + 5);

      let y = doc.y + 29;
      doc.moveTo(48, y).lineTo(right, y).strokeColor("#dce4ed").stroke();
      y += 18;
      doc.font("Heading").fontSize(9).fillColor(muted).text("INVOICE / ORDER ID", 48, y);
      doc.text("PAID ON (UTC)", 355, y);
      doc.font("Body").fontSize(10).fillColor(ink).text(`OPX-${text(order.id)}`, 48, y + 17, { width: 280 });
      doc.text(order.paidAt.toISOString().replace("T", " ").slice(0, 19), 355, y + 17, { width: right - 355 });

      y += 62;
      doc.roundedRect(48, y, width, 32, 5).fill("#eef4fa");
      doc.font("Heading").fontSize(9).fillColor(muted).text("PURCHASE", 62, y + 11);
      doc.text("AMOUNT PAID", 395, y + 11, { width: right - 409, align: "right" });
      y += 49;
      doc.font("Heading").fontSize(13).fillColor(ink).text(text(order.packageName), 62, y, { width: 310, lineGap: 3 });
      let detailsY = doc.y + 9;
      doc.fontSize(12).text(money(order.amountMinor), 388, y, { width: right - 402, align: "right" });
      doc.font("Body").fontSize(10).fillColor(muted);
      if (test) {
        doc.text("Live test payment - no subscription or service activated.", 62, detailsY, { width: 310, lineGap: 3 });
      } else {
        doc.text(`Provider: ${text(order.providerName)}`, 62, detailsY, { width: 310, lineGap: 3 });
        if (order.durationLabel) doc.text(`Duration: ${text(order.durationLabel)}`, 62, doc.y + 5, { width: 310, lineGap: 3 });
      }
      y = doc.y + 27;
      if (y > 550) {
        doc.addPage();
        y = 64;
      }
      doc.moveTo(48, y).lineTo(right, y).strokeColor("#dce4ed").stroke();
      y += 23;
      doc.font("Heading").fontSize(13).fillColor(ink).text("Total paid", 62, y);
      doc.fontSize(22).text(money(order.amountMinor), 310, y - 4, { width: right - 324, align: "right" });
      y = doc.y + 15;
      doc.font("Body").fontSize(10).fillColor(muted).text("Balance due", 62, y);
      doc.text(money(0), 350, y, { width: right - 364, align: "right" });

      y = doc.y + 32;
      doc.fontSize(9).text(
        "The total is the amount verified as paid, including any surcharge charged at checkout. This receipt does not itemize or certify tax deductions.",
        62, y, { width: width - 28, lineGap: 4 }
      );
      doc.text(test
        ? "This is a real payment test, not a purchase of a subscription."
        : "Payment confirmation does not by itself confirm service activation.",
        62, doc.y + 11, { width: width - 28, lineGap: 4 });
      doc.fontSize(9).fillColor(muted).text("Keep this PDF for your records. You can share the downloaded file with support.", 48, 765, { width, align: "center" });
      doc.end();
    } catch (error) {
      doc.destroy();
      reject(error);
    }
  });
}
