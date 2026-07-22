import { FriendsManager } from "@/components/friends-manager";
import { HouseholdSection } from "@/components/household-section";
import { DietSection } from "@/components/diet-section";

export const dynamic = "force-dynamic";

export default function AmigosPage() {
  return (
    <div className="py-4">
      <h1 className="font-display text-2xl font-semibold text-ink">Amigos y hogar</h1>
      <p className="mb-6 text-sm text-ink/60">
        Comparte el plan y la compra con quien vive contigo, o rétale en El Duelo.
      </p>
      <div className="space-y-8">
        <HouseholdSection />
        <DietSection />
        <FriendsManager />
      </div>
    </div>
  );
}
