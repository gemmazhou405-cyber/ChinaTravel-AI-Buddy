import { Fragment } from 'react';
import content from '../data/amapEnglishSetup.json';
import { parseInline, shotIds, shotMaxWidth, splitShots } from '../lib/amapGuideMarkup.mjs';

type Block =
  | { type: 'p'; text: string }
  | { type: 'note'; text: string }
  | { type: 'ol' | 'ul'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'shots'; ids: string[]; labels?: string[] };
type Section = { id: string; title: string; blocks: Block[]; subsections?: Section[] };
type Shot = { src: string; width: number; height: number; alt: string };

const sections = content.sections as Section[];
const screenshots = content.screenshots as Record<string, Shot>;
const firstShotId = shotIds(content)[0];

export function AmapRichText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        if (token.type === 'strong') return <strong key={index} className="font-semibold text-gray-900">{token.text}</strong>;
        if (token.type === 'em') return <em key={index}>{token.text}</em>;
        if (token.type === 'link') {
          const external = token.href.startsWith('http');
          return <a key={index} href={token.href} rel={external ? 'noopener noreferrer' : undefined} className="font-semibold text-[#155e63] underline underline-offset-4">{token.text}</a>;
        }
        return <Fragment key={index}>{token.text}</Fragment>;
      })}
    </>
  );
}

// Rows wrap on narrow screens and stay centred.
function ShotRow({ ids, labels = [] }: { ids: string[]; labels?: string[] }) {
  const maxWidth = shotMaxWidth(ids.length);
  return (
    <div className="my-3 flex flex-wrap justify-center gap-4">
      {ids.map((id, index) => {
        const shot = screenshots[id];
        return (
          <figure key={id} className="w-full" style={{ maxWidth, flex: `1 1 ${Math.min(maxWidth, 160)}px` }}>
            <img src={shot.src} width={shot.width} height={shot.height} alt={shot.alt} loading={id === firstShotId ? undefined : 'lazy'} decoding="async" className="block h-auto w-full rounded-2xl border border-[#155e63]/15" />
            <figcaption className="mt-1.5 text-xs text-gray-500">
              {labels[index] && <strong className="block text-sm text-gray-900">{labels[index]}</strong>}
              {content.screenshotCaption}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function Flow({ text, paragraphClassName = 'text-sm leading-relaxed text-gray-600 md:text-base' }: { text: string; paragraphClassName?: string }) {
  return (
    <>
      {splitShots(text).map((segment, index) => segment.type === 'shots' ? (
        <ShotRow key={index} ids={segment.ids} />
      ) : (
        <p key={index} className={paragraphClassName}><AmapRichText text={segment.text.trim()} /></p>
      ))}
    </>
  );
}

function GuideBlock({ block }: { block: Block }) {
  if (block.type === 'p') return <Flow text={block.text} />;
  if (block.type === 'shots') return <ShotRow ids={block.ids} labels={block.labels} />;
  if (block.type === 'note') {
    return (
      <aside aria-label="Local note" className="rounded-xl border border-amber-300/60 border-l-4 border-l-amber-600 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 md:text-base">
        <p><strong className="tracking-wide">LOCAL NOTE:</strong> <AmapRichText text={block.text} /></p>
      </aside>
    );
  }
  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {block.headers.map((header) => <th key={header} scope="col" className="pb-2 pr-4 font-semibold text-gray-950">{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]} className="border-b border-gray-100 last:border-0">
                {row.map((cell, index) => <td key={index} className={`py-2 pr-4 align-top leading-relaxed text-gray-600${index === 0 ? ' font-semibold text-gray-800' : ''}`}><AmapRichText text={cell} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const List = block.type === 'ol' ? 'ol' : 'ul';
  return (
    <List className={`space-y-3 pl-5 ${block.type === 'ol' ? 'list-decimal' : 'list-disc'} list-outside`}>
      {block.items.map((item) => (
        <li key={item} className="pl-1 text-sm leading-relaxed text-gray-600 md:text-base">
          <Flow text={item} paragraphClassName="" />
        </li>
      ))}
    </List>
  );
}

export function AmapByline() {
  return (
    <p className="mt-2 text-sm text-gray-600">
      <a href="#lin-help" className="font-semibold text-[#155e63] underline underline-offset-4">{content.byline.name}</a> · {content.byline.tested}
    </p>
  );
}

export function AmapQuickAnswer() {
  return (
    <div className="mt-2 space-y-3 text-sm leading-relaxed text-gray-700 md:text-base">
      {content.quickAnswer.map((paragraph) => <p key={paragraph}><AmapRichText text={paragraph} /></p>)}
    </div>
  );
}

export function AmapCtaCard() {
  return (
    <aside aria-label="App setup help" className="rounded-2xl border border-[#155e63]/20 bg-[#155e63]/5 p-4 md:p-5">
      <p className="text-sm leading-relaxed text-gray-800 md:text-base"><AmapRichText text={content.cta.text} /></p>
      <a href={content.cta.href} target="_blank" rel="noopener noreferrer" data-planning-help="fiverr" data-planning-placement="amap-setup" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#155e63] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e4a4e]">
        {content.cta.label}
      </a>
    </aside>
  );
}

export function AmapGuideBody() {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="space-y-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:p-5">
          <h2 id={section.id} className="text-lg font-bold text-gray-950 md:text-xl">{section.title}</h2>
          {section.blocks.map((block, index) => <GuideBlock key={index} block={block} />)}
          {section.subsections?.map((sub) => (
            <Fragment key={sub.id}>
              <h3 id={sub.id} className="pt-2 text-base font-bold text-gray-950">{sub.title}</h3>
              {sub.blocks.map((block, index) => <GuideBlock key={index} block={block} />)}
            </Fragment>
          ))}
        </section>
      ))}
    </div>
  );
}

const richAnswers = new Map(content.faqs.map(({ question, answer }) => [question, answer]));

export function AmapFaqAnswer({ question }: { question: string }) {
  return <AmapRichText text={richAnswers.get(question) ?? ''} />;
}
