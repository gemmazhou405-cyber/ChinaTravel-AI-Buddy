const USE_CASES = [
  'Show phrases to locals',
  'Decode menus',
  'Handle payments',
  'Get transport help',
  'Emergency phrases',
];

export default function VisitorTrustSection() {
  return (
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm font-medium leading-relaxed text-gray-700">
          Built for first-time visitors, business travelers, students, and families visiting China.
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
          {USE_CASES.map((item) => (
            <span
              key={item}
              className="shrink-0 rounded-full border border-[#155e63]/12 bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#155e63]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
