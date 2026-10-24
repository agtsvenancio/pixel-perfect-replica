import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getMenuItem } from "@/data/menu";

export type CartLine = { id: string; size: string; quantity: number };

type CartCtx = {
  lines: CartLine[];
  packageIds: string[];
  count: number;
  subtotal: number;
  servesApprox: number;
  add: (id: string, quantity?: number, size?: string) => void;
  addMany: (items: { id: string; quantity: number }[], packageId?: string) => void;
  setQty: (id: string, size: string, quantity: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  presetEvent: string;
  openWithEvent: (eventType: string) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ib-cart-v1";

export function lineInfo(l: CartLine) {
  const item = getMenuItem(l.id);
  if (!item) return null;
  const size = item.sizes?.find((s) => s.label === l.size);
  const unitPrice = size?.price ?? item.price;
  const serves = size?.servesApprox ?? item.servesApprox;
  return { item, unitPrice, serves, lineTotal: unitPrice * l.quantity };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [presetEvent, setPresetEvent] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.lines)) setLines(parsed.lines.filter((l: CartLine) => getMenuItem(l.id)));
        if (Array.isArray(parsed.packageIds)) setPackageIds(parsed.packageIds);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ lines, packageIds }));
    } catch {
      /* ignore */
    }
  }, [lines, packageIds, loaded]);

  const add = useCallback((id: string, quantity = 1, size?: string) => {
    const item = getMenuItem(id);
    if (!item) return;
    const s = size ?? item.sizeLabel;
    setLines((prev) => {
      const ex = prev.find((l) => l.id === id && l.size === s);
      if (ex) return prev.map((l) => (l === ex ? { ...l, quantity: l.quantity + quantity } : l));
      return [...prev, { id, size: s, quantity }];
    });
  }, []);

  const addMany = useCallback(
    (items: { id: string; quantity: number }[], packageId?: string) => {
      items.forEach((i) => add(i.id, i.quantity));
      if (packageId) setPackageIds((p) => (p.includes(packageId) ? p : [...p, packageId]));
    },
    [add],
  );

  const setQty = useCallback((id: string, size: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !(l.id === id && l.size === size))
        : prev.map((l) => (l.id === id && l.size === size ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback((id: string, size: string) => setQty(id, size, 0), [setQty]);
  const clear = useCallback(() => {
    setLines([]);
    setPackageIds([]);
  }, []);

  const openWithEvent = useCallback((e: string) => {
    setPresetEvent(e);
    setOpen(true);
  }, []);

  const value = useMemo(() => {
    let count = 0, subtotal = 0, servesApprox = 0;
    for (const l of lines) {
      const info = lineInfo(l);
      if (!info) continue;
      count += l.quantity;
      subtotal += info.lineTotal;
      servesApprox += info.serves * l.quantity;
    }
    return { lines, packageIds, count, subtotal, servesApprox, add, addMany, setQty, remove, clear, open, setOpen, presetEvent, openWithEvent };
  }, [lines, packageIds, add, addMany, setQty, remove, clear, open, presetEvent, openWithEvent]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
