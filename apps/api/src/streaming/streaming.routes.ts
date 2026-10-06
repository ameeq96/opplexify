import { Router } from "express";
import { asyncHandler } from "../http";
import { prisma } from "../prisma/prisma.service";
import { fetchStreamingCatalog, selectedPackageId } from "./catalog";
import { ensureSharedCheckoutOwner, isSharedCheckoutSelection, sharedCheckoutKey, sharedCheckoutPublicToken, verifySharedCheckout } from "./shared-checkout";

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
      res.json({
        plans: catalog.plans,
        devices: catalog.devices,
        selectedPackageId: selectedPackageId(selection, signature, catalog.plans)
      });
    })
  );

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
