import { ServiceCostInput } from '@/components/shared/ServiceCostInput';

export function GlobalSidebar() {
  return (
    <aside
      role="complementary"
      aria-label="Global Parameters"
      className="w-[280px] h-full p-6 bg-white border-r border-surface-alternate"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-900">Global Parameters</h2>

        <div className="flex flex-col gap-4">
          <ServiceCostInput />
        </div>
      </div>
    </aside>
  );
}
