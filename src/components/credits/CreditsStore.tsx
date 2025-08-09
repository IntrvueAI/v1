
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Pack = 1 | 5 | 10;

const PACKS: { credits: Pack; priceCents: number; label: string; note?: string }[] = [
  { credits: 1, priceCents: 1499, label: "1 Credit", note: "Great for a quick try" },
  { credits: 5, priceCents: 4999, label: "5 Credits", note: "Most popular" },
  { credits: 10, priceCents: 7999, label: "10 Credits", note: "Best value" },
];

export const CreditsStore: React.FC = () => {
  const { toast } = useToast();
  const [loadingPack, setLoadingPack] = React.useState<Pack | null>(null);

  const handleBuy = async (pack: Pack) => {
    setLoadingPack(pack);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { pack, origin: window.location.origin },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error("Failed to create payment session.");
      }

      window.location.href = data.url as string;
    } catch (e: any) {
      console.error("create-payment failed", e);
      toast({
        title: "Unable to start checkout",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
      setLoadingPack(null);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {PACKS.map((p) => (
        <Card key={p.credits} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{p.label}</CardTitle>
              {p.note && (
                <Badge variant="outline" className="text-xs">
                  {p.note}
                </Badge>
              )}
            </div>
            <CardDescription>Each credit = 1 interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              ${(p.priceCents / 100).toFixed(2)}
              <span className="text-muted-foreground text-sm ml-1">USD</span>
            </div>
            <Button
              className="w-full"
              onClick={() => handleBuy(p.credits)}
              disabled={loadingPack !== null}
            >
              {loadingPack === p.credits ? "Redirecting..." : `Buy ${p.credits} credit${p.credits > 1 ? "s" : ""}`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Secure checkout via Stripe. You’ll be redirected to complete your purchase.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
