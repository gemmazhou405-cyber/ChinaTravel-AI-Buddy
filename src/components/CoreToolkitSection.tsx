const TOOLKIT_ITEMS = ['Phrases', 'Payments', 'Food', 'Transport', 'Emergency'];

export default function CoreToolkitSection() {
  return (
    <section className="border-b border-[#155e63]/10 bg-white/50 px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Travel basics, ready when you need them.
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:pb-0">
            {TOOLKIT_ITEMS.map((item) => (
              <span
                key={item}
                className="shrink-0 rounded-full border border-[#155e63]/12 bg-[#f7f3ea] px-3 py-1.5 text-xs font-semibold text-[#155e63]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
