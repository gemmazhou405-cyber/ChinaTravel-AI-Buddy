const USE_CASES = [
  'show useful Chinese phrases to locals',
  'understand food, payment, transport, and hotel situations',
  'get emergency help fast',
  'ask Buddy when you are stuck',
];

export default function VisitorTrustSection() {
  return (
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-4">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#155e63]/10 bg-white/80 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Built for foreign visitors in China</p>
        <h2 className="mt-1 text-base font-bold tracking-tight text-gray-950">Use ChinaEase Buddy when you need to:</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USE_CASES.map((item) => (
            <div key={item} className="rounded-2xl border border-white bg-white px-3.5 py-3 text-sm font-medium text-gray-700 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
