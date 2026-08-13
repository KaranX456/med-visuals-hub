import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthorizationDetails = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? (s['authorization_id'] as string) : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const details = data as AuthorizationDetails | null;
    const immediate = details?.redirect_url ?? details?.redirect_to;
    if (immediate && !details?.client) throw redirect({ href: immediate });
    return details;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="grid min-h-dvh place-items-center px-4 text-sm text-muted-foreground">
      Could not load this authorization request: {String((error as Error)?.message ?? error)}
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as AuthorizationDetails | null;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "this app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: err } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id)
      : await supabase.auth.oauth.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const decision = data as { redirect_url?: string; redirect_to?: string } | null;
    const target = decision?.redirect_url ?? decision?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <span className="grid size-10 place-items-center rounded-xl gradient-clinical text-primary-foreground">
            <HeartPulse className="size-5" aria-hidden />
          </span>
          <CardTitle className="text-base">Connect {clientName} to your account</CardTitle>
          <CardDescription>
            {clientName} will be able to read and update your own health record — symptoms, medications and lab
            results — acting as you. It cannot see other people's records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" disabled={busy} onClick={() => decide(true)}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null} Approve
          </Button>
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => decide(false)}>
            Deny
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
