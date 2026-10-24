import { lazy, Suspense, useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

// The order drawer (checkout form, validation, order submission) is only downloaded
// the first time someone opens their order, which keeps the first page load light.
const CartDrawer = lazy(() => import("./CartDrawer").then((m) => ({ default: m.CartDrawer })));

export function LazyCartDrawer() {
  const { open } = useCart();
  const [needed, setNeeded] = useState(false);
  useEffect(() => {
    if (open) setNeeded(true);
  }, [open]);
  if (!needed) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
}
