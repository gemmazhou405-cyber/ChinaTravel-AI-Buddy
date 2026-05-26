const TOOLKIT_ITEMS = [
  {
    title: 'Phrase cards',
    body: 'Ready-to-show Chinese for taxis, hotels, restaurants, hospitals, and everyday situations.',
  },
  {
    title: 'Pay in China',
    body: 'Understand Alipay, WeChat Pay, cards, and cash before you reach the counter.',
  },
  {
    title: 'Food & menu help',
    body: 'Look up common dishes, allergens, spice levels, and restaurant phrases with less guesswork.',
  },
  {
    title: 'Transport & emergency',
    body: 'Find the right words for airports, trains, taxis, police, ambulance, and urgent help.',
  },
];

export default function CoreToolkitSection() {
  return (
    <section className="border-b border-[#155e63]/10 bg-white/55 px-4 py-7">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Core Toolkit</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-950">
            Everything you need for daily travel in China
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLKIT_ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#155e63]/10 bg-[#f7f3ea]/70 p-4">
              <h3 className="text-sm font-bold text-gray-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
