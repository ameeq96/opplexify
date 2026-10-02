import { Router } from "express";
import { asyncHandler } from "../http";
import { prisma } from "../prisma/prisma.service";
import { fetchStreamingCatalog, selectedPackageId } from "./catalog";

export function createStreamingRouter() {
  const router = Router();

  router.get(
    "/catalog",
    asyncHandler(async (req, res) => {
      const catalog = await fetchStreamingCatalog();
      const selection = Array.isArray(req.query.selection) ? req.query.selection[0] : req.query.selection;
      const signature = Array.isArray(req.query.signature) ? req.query.signature[0] : req.query.signature;

      res.setHeader("Cache-Control", "no-store");
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
