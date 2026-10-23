"""Release acceptance for visible planning help and curated links in built HTML.

Uses the standard library so the release check needs no extra Python packages.
Run after npm run build. This validates publication, not indexing or ranking.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import os
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = Path(os.environ.get('PAGE_QUALITY_DIST', ROOT / 'dist'))
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def find(self, tag=None, **attrs):
        found = []
        for child in self.children:
            if not isinstance(child, Node):
                continue
            if (tag is None or child.tag == tag) and all(child.attrs.get(k) == v for k, v in attrs.items()):
                found.append(child)
            found.extend(child.find(tag, **attrs))
        return found

    def text(self):
        return ' '.join(child.text() if isinstance(child, Node) else child for child in self.children)


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def load_json(path):
    return json.loads((ROOT / path).read_text())


help_copy = load_json('src/data/planningHelp.json')
related = load_json('src/data/guideRelatedLinks.json')
# Pages written to a spec render their copy from these files; the checks below compare the built HTML with them.
rich_guides = {
    'amap-english-mode-guide-2026': ('Amap', load_json('src/data/amapEnglishSetup.json')),
    'alipay-metro-qr-transport-code-guide': ('Alipay metro', load_json('src/data/alipayMetroGuide.json')),
}
locations = [node.text for node in ET.parse(DIST / 'sitemap.xml').getroot().iter() if node.tag.endswith('}loc')]
paths = {urlparse(url).path for url in locations}
audit_paths = paths | {'/', '/plan/', '/pricing/'}
excluded = {'terms', 'privacy', 'refund', 'contact', 'about', 'unsubscribe'}
errors, checked, with_help, with_related = [], 0, 0, 0


def require(condition, message):
    if not condition:
        errors.append(message)


for pathname in sorted(audit_paths):
    slug = pathname.strip('/')
    file = DIST / slug / 'index.html'
    require(file.exists(), f'{pathname}: no built HTML')
    if not file.exists():
        continue
    document = Document(file.read_text()).root
    checked += 1
    h1 = document.find('h1')
    require(len(h1) == 1, f'{pathname}: expected one H1, got {len(h1)}')
    canonical = document.find('link', rel='canonical')
    require(len(canonical) == 1 and canonical[0].attrs.get('href') == f'https://chinaeasebuddy.com{pathname}', f'{pathname}: canonical mismatch')
    ids = [node.attrs['id'] for node in document.find() if node.attrs.get('id')]
    require(len(ids) == len(set(ids)), f'{pathname}: duplicate HTML ids')
    for anchor in document.find('a'):
        href = anchor.attrs.get('href', '')
        if href.startswith('#') and len(href) > 1:
            require(unquote(href[1:]) in ids, f'{pathname}: broken local anchor {href}')
    if slug in excluded:
        continue
    # Match presence; a boolean attribute's value is None, as is a missing key.
    boxes = [node for node in document.find('section') if 'data-planning-help-box' in node.attrs]
    require(len(boxes) == 1, f'{pathname}: expected one visible planning help box, got {len(boxes)}')
    if boxes:
        with_help += 1
        box = boxes[0]
        text = ' '.join(box.text().split())
        for key in ['heading', 'body', 'email', 'note']:
            require(help_copy[key] in text, f'{pathname}: visible planning help missing {key}')
        require(not re.search(r'\bAI\b|£249|£29', text), f'{pathname}: unverified planning promise')
        email_links = box.find('a', href=help_copy['emailHref'])
        paid_links = box.find('a', href=help_copy['paidHref'])
        require(len(email_links) == 1 and len(paid_links) == 1, f'{pathname}: planning destinations missing')
        if paid_links:
            require(paid_links[0].attrs.get('target') == '_blank' and {'noopener', 'noreferrer'} <= set(paid_links[0].attrs.get('rel', '').split()), f'{pathname}: paid link window protection missing')
        if slug not in {'', 'plan', 'pricing', 'guides', 'partners/china-visa-checker'}:
            require(len(document.find('a', href='#lin-help')) == 1 and document.find('a', href='#lin-help')[0].text().strip() == help_copy['byline'], f'{pathname}: planning contact byline missing')
    if slug == 'pricing':
        pricing_text = document.find('main')[0].text()
        require(help_copy['digitalHeading'] in pricing_text and help_copy['digitalScope'] in pricing_text, 'Pricing: personal services and message passes must have separate scopes')
    if slug in {'', 'plan', 'pricing', 'guides', 'partners/china-visa-checker'}:
        continue
    navs = document.find('nav', **{'aria-label': 'Related China travel guides'})
    require(len(navs) == 1, f'{pathname}: curated related navigation missing')
    if navs:
        with_related += 1
        hrefs = [node.attrs.get('href') for node in navs[0].find('a')]
        expected = [item['href'] for item in related[slug]]
        require(hrefs == expected and 5 <= len(hrefs) <= 8, f'{pathname}: wrong related links/count')
        require(len(set(hrefs)) == len(hrefs) and pathname not in hrefs, f'{pathname}: duplicate or self-related link')
        require(all(href in paths for href in hrefs), f'{pathname}: related link outside canonical sitemap')
    if slug in rich_guides:
        name, guide = rich_guides[slug]
        require(h1[0].text().strip() == guide['heading'], f'{name}: H1 differs from shared content')
        body_text = document.find('main')[0].text()
        require(guide['byline']['tested'] in ' '.join(body_text.split()), f'{name}: byline missing')
        for section in guide['sections']:
            for section_id in [section['id'], *[sub['id'] for sub in section.get('subsections', [])]]:
                require(section_id in ids, f'{name}: missing section {section_id}')
        schemas = [json.loads(node.text()) for node in document.find('script', type='application/ld+json')]
        faqs = []
        for schema in schemas:
            for item in schema.get('@graph', [schema]):
                if item.get('@type') == 'FAQPage':
                    faqs.extend(item['mainEntity'])
        plain = lambda text: re.sub(r'\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\([^)]+\)', lambda m: next(g for g in m.groups() if g is not None), text)
        expected_faqs = [(item['question'], plain(item['answer'])) for item in guide['faqs']]
        require([(q['name'], q['acceptedAnswer']['text']) for q in faqs] == expected_faqs, f'{name}: FAQ schema does not match shared visible answers')
        flat_text = re.sub(r'\s+([.,;:])', r'\1', ' '.join(body_text.split()))
        for question, answer in expected_faqs:
            require(question in flat_text and answer in flat_text, f'{name}: FAQ missing from visible HTML: {question}')

if errors:
    print('\n'.join(f'FAIL {error}' for error in errors))
    raise SystemExit(1)
print(json.dumps({'status': 'PASS', 'sitemapPages': len(paths), 'checkedPages': checked, 'visiblePlanningHelpPages': with_help, 'curatedGuidePages': with_related, 'indexingOrRankingClaim': False}))
