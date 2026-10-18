import { Router } from "express";
import { createHash } from "node:crypto";
import { asyncHandler } from "../http";
import { prisma } from "../prisma/prisma.service";
import { fetchStreamingCatalog, selectedPackageId } from "./catalog";
import { ensureSharedCheckoutOwner, isSharedCheckoutSelection, sharedCheckoutKey, sharedCheckoutOwner, sharedCheckoutPublicToken, verifySharedCheckout } from "./shared-checkout";
import { resumeCheckoutStatus, verifyResumeCheckout } from "./resume-checkout";
import { webOrigin } from "../env";
import { enqueueCustomerEvent } from "./customer-sync";

export function createStreamingRouter() {
  const router = Router();

  router.get(
    "/catalog",
    asyncHandler(async (req, res) => {
      const catalog = await fetchStreamingCatalog();
      const selection = Array.isArray(req.query.selection) ? req.query.selection[0] : req.query.selection;
      const signature = Array.isArray(req.query.signature) ? req.query.signature[0] : req.query.signature;

      res.setHeader("Cache-Control", "private, no-store");
      if (isSharedCheckoutSelection(selection)) {
        const shared = verifySharedCheckout(selection, signature, catalog.plans, catalog.devices);
        if (!shared) {
          res.json({ plans: catalog.plans, devices: catalog.devices, selectedPackageId: null, sharedCheckout: null });
          return;
        }
        const owner = ensureSharedCheckoutOwner(req, res);
        const sharedKey = sharedCheckoutKey(shared);
        const actorHash = createHash("sha256").update(`opplexify:customer-actor:${owner}`).digest("hex");
        await enqueueCustomerEvent(prisma, {
          eventType: "share.opened", entityType: "shared_checkout", entityId: sharedKey,
          dedupeKey: actorHash,
          data: { checkout_key: sharedKey, actor_hash: actorHash, package_id: shared.package_id,
            amount_minor: shared.total_minor, currency: shared.currency }
        });
        const existing = await prisma.streamingOrder.findUnique({
          where: { checkoutKey: sharedCheckoutKey(shared) },
          select: { publicToken: true, status: true, safepayTracker: true }
        });
        const status = existing?.status === "PAID" ? "paid"
          : existing && existing.publicToken !== sharedCheckoutPublicToken(shared, owner) ? "in_use"
          : existing?.status === "CANCELLED" || (existing?.status === "FAILED" && existing.safepayTracker) ? "failed"
          : "available";
        res.json({
          plans: catalog.plans,
          devices: catalog.devices,
          selectedPackageId: shared.package_id,
          sharedCheckout: {
            expiresAt: new Date(shared.exp * 1000).toISOString(),
            deviceId: shared.device_id,
            totalMinor: shared.total_minor,
            status
          }
        });
        return;
      }
      const selected = selectedPackageId(selection, signature, catalog.plans);
      if (selected !== null) ensureSharedCheckoutOwner(req, res);
      res.json({
        plans: catalog.plans,
        devices: catalog.devices,
        selectedPackageId: selected
      });
    })
  );

  router.post("/checkout-resume", asyncHandler(async (req, res) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (req.get("Origin") !== webOrigin) {
      res.status(403).json({ message: "Open your saved payment link in its original browser." });
      return;
    }
    const owner = sharedCheckoutOwner(req);
    if (!owner || typeof req.body?.resume_token !== "string" || !/^rc3_[A-Za-z0-9_-]{60,2048}$/.test(req.body.resume_token)) {
      res.status(404).json({ message: "This saved payment link is invalid, expired or belongs to another browser." });
      return;
    }
    const catalog = await fetchStreamingCatalog();
    const selection = verifyResumeCheckout(req.body.resume_token, owner, catalog.plans, catalog.devices);
    if (!selection) {
      res.status(404).json({ message: "This saved payment link is invalid, expired or belongs to another browser." });
      return;
    }
    const order = await prisma.streamingOrder.findUnique({ where: { checkoutKey: selection.checkout_key } });
    const status = resumeCheckoutStatus(selection, order);
    res.json({
      plans: catalog.plans.filter((plan) => plan.id === selection.package_id),
      devices: [],
      selectedPackageId: selection.package_id,
      resumeCheckout: { expiresAt: new Date(selection.exp * 1000).toISOString(), deviceId: selection.device_id,
        totalMinor: selection.total_minor, status }
    });
  }));

  router.get(
    "/orders/:publicToken",
    asyncHandler(async (req, res) => {
      const tokenParam = req.params.publicToken;
      const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
      if (!token || token.length > 191) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      const order = await prisma.streamingOrder.findUnique({ where: { publicToken: token } });
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      res.setHeader("Cache-Control", "no-store");
      res.json({
        order: {
          token: order.publicToken,
          status: order.status,
          providerName: order.providerName,
          packageName: order.packageName,
          durationLabel: order.durationLabel,
          amount: Number(order.amount),
          currency: order.currency,
          paidAt: order.paidAt?.toISOString() ?? null,
          createdAt: order.createdAt.toISOString()
        }
      });
    })
  );

  return router;
}
