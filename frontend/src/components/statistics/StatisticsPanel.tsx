// StatisticsPanel.tsx
import VisitStats from "./components/VisitStats";
import PetTypeStats from "./components/PetTypeStats";

export default function StatisticsPanel() {
  return (
    <div className="col-span-1 space-y-6">
      <VisitStats />
      <PetTypeStats />
    </div>
  );
}
