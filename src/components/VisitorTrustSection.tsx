const USE_CASES = [
  'Show it in Chinese',
  'Ask Buddy',
  'Handle emergencies',
];

export default function VisitorTrustSection() {
  return (
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-3.5">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm font-semibold leading-relaxed text-gray-800">
          For moments when you need help fast.
        </p>
        <div className="mt-2.5 flex justify-center gap-2 overflow-x-auto pb-1">
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
