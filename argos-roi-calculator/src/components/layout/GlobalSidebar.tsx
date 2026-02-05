import { useAppStore } from '@/stores/app-store';

export interface GlobalSidebarProps {}

export function GlobalSidebar(_props?: GlobalSidebarProps) {
  const detectionRate = useAppStore((state) => state.globalParams.detectionRate);
  const serviceCost = useAppStore((state) => state.globalParams.serviceCostPerPump);

  return (
    <aside
      role="complementary"
      aria-label="Global Parameters"
      className="w-[280px] h-full p-6 bg-white border-r border-surface-alternate"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-900">Global Parameters</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Detection Rate:</span>
            <span className="text-base font-medium text-gray-900">{detectionRate}%</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Service Cost:</span>
            <span className="text-base font-medium text-gray-900">
              €{serviceCost.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
