#!/usr/bin/env python3
"""Check deployed raw HTML using curl as Googlebot; no JavaScript required.

Usage: python scripts/audit-live-lin-help.py --output report.txt
Exit 1 on any failed page, including fetch errors. Non-articles show N/A.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
COPY = json.loads((ROOT / 'src/data/planningHelp.json').read_text())
RELATED = json.loads((ROOT / 'src/data/guideRelatedLinks.json').read_text())
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
NON_ARTICLES = {'/', '/guides/', '/partners/china-visa-checker/', '/plan/', '/pricing/'}
SKIP = {'/terms/', '/privacy/', '/contact/'}

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def find(self, tag=None, **attrs):
        nodes = []
        for child in self.children:
            if isinstance(child, Node):
                if (tag is None or child.tag == tag) and all(child.attrs.get(k) == v for k, v in attrs.items()):
                    nodes.append(child)
                nodes.extend(child.find(tag, **attrs))
        return nodes
    def text(self):
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)

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
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break
    def handle_data(self, data):
        self.stack[-1].children.append(data)

def fetch(url):
    result = subprocess.run(['curl', '--silent', '--show-error', '--fail', '--retry', '2',
        '--max-time', '30', '-A', 'Googlebot', '--write-out', '\n%{http_code}', url],
        capture_output=True, text=True, timeout=100)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or f'curl exit {result.returncode}')
    html, code = result.stdout.rsplit('\n', 1)
    if code != '200':
        raise RuntimeError(f'HTTP {code}')
    return html

def check(url):
    path = urlparse(url).path
    article = path not in NON_ARTICLES
    row = {'path': path, 'email': 'NO', 'maintained': 'NO' if article else 'N/A',
           'related': '0' if article else 'N/A', 'result': 'FAIL', 'errors': []}
    try:
        document = Document(fetch(url)).root
        boxes = [n for n in document.find('section') if 'data-planning-help-box' in n.attrs]
        if len(boxes) != 1:
            row['errors'].append(f'expected 1 LinBox, got {len(boxes)}')
        if boxes:
            box = boxes[0]
            text = ' '.join(box.text().split())
            row['email'] = 'YES' if COPY['email'] in text and box.find('a', href=COPY['emailHref']) else 'NO'
            for key in ['heading', 'body', 'note', 'emailLabel', 'paidLabel']:
                if COPY[key] not in text:
                    row['errors'].append(f'box missing {key}')
            if 'Digital message passes do not include this service.' in text or 'AI' in text.split():
                row['errors'].append('unwanted box copy')
            paid = box.find('a', href=COPY['paidHref'])
            if len(paid) != 1 or paid[0].attrs.get('target') != '_blank' or not {'noopener', 'noreferrer'} <= set(paid[0].attrs.get('rel', '').split()):
                row['errors'].append('Fiverr link invalid')
        if row['email'] != 'YES':
            row['errors'].append('visible email/mailto missing')
        if article:
            bylines = document.find('a', href='#lin-help')
            row['maintained'] = 'YES' if len(bylines) == 1 and bylines[0].text().strip() == COPY['byline'] else 'NO'
            if row['maintained'] != 'YES':
                row['errors'].append('maintenance byline missing')
            navs = document.find('nav', **{'aria-label': 'Related China travel guides'})
            hrefs = [n.attrs.get('href') for n in navs[0].find('a')] if len(navs) == 1 else []
            row['related'] = str(len(hrefs))
            expected = [item['href'] for item in RELATED.get(path.strip('/'), [])]
            if not 5 <= len(hrefs) <= 8 or hrefs != expected or path in hrefs or len(set(hrefs)) != len(hrefs):
                row['errors'].append('related links/count mismatch')
        if not row['errors']:
            row['result'] = 'PASS'
    except Exception as error:
        row['errors'].append(str(error))
    return row

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--origin', default='https://chinaeasebuddy.com')
    parser.add_argument('--workers', type=int, default=5)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    origin = args.origin.rstrip('/')
    sitemap = ET.fromstring(fetch(origin + '/sitemap.xml'))
    urls = [n.text for n in sitemap.iter() if n.tag.split('}')[-1] == 'loc']
    if not urls or any(urlparse(url).netloc != urlparse(origin).netloc for url in urls):
        raise RuntimeError('empty sitemap or unexpected sitemap origin')
    checked = sorted({url for url in urls if urlparse(url).path not in SKIP} | {origin+'/plan/', origin+'/pricing/'})
    with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 10))) as executor:
        rows = list(executor.map(check, checked))
    failed = sum(row['result'] != 'PASS' for row in rows)
    lines = [f'UTC: {datetime.now(timezone.utc).isoformat()}', f'Origin: {origin}; User-Agent: Googlebot; raw HTML; HTTP 200 required',
             f'Sitemap: {len(urls)} URLs; skipped: /terms/ /privacy/ /contact/; extra: /plan/ /pricing/',
             'N/A = non-article; email and full LinBox copy are still required.',
             'PATH | EMAIL | MAINTAINED | RELATED | RESULT']
    for row in rows:
        line = ' | '.join(row[k] for k in ['path', 'email', 'maintained', 'related', 'result'])
        if row['errors']:
            line += ' | ' + '; '.join(row['errors'])
        lines.append(line)
    lines.append(f"TOTAL: {len(rows)} checked; {len(rows)-failed} PASS; {failed} FAIL; articles: {sum(r['path'] not in NON_ARTICLES for r in rows)}")
    report = '\n'.join(lines)+'\n'
    print(report, end='')
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(report)
    raise SystemExit(1 if failed else 0)

if __name__ == '__main__':
    main()
