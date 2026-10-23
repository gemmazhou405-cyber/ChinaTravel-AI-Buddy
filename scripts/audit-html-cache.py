#!/usr/bin/env python3
"""Real curl HEAD matrix and byte-for-byte GET cache-busting comparison."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import time

ORIGIN = 'https://chinaeasebuddy.com'
def curl(path, ua, head=False):
    command = ['curl', '-sS', '--fail', '--max-time', '45', '-A', ua]
    command += ['-I'] if head else ['-D', '-']
    r = subprocess.run(command + [ORIGIN+path], capture_output=True, timeout=50)
    if r.returncode:
        raise RuntimeError(r.stderr.decode(errors='replace'))
    # There may be CONNECT response headers from the execution proxy.
    remaining = r.stdout.replace(b'\r\n', b'\n') if head else r.stdout
    sep = b'\n\n' if head else b'\r\n\r\n'
    blocks = []
    while remaining.startswith(b'HTTP/'):
        header, remaining = remaining.split(sep, 1)
        blocks.append(header.decode())
    header = blocks[-1]
    headers = {line.split(':',1)[0].lower():line.split(':',1)[1].strip() for line in header.splitlines()[1:] if ':' in line}
    if ' 200' not in header.splitlines()[0]:
        raise RuntimeError(header.splitlines()[0])
    return headers, remaining, '\n\n'.join(blocks)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--head',action='store_true')
    p.add_argument('--require-plan-placement',action='store_true')
    p.add_argument('--output',type=Path,required=True)
    a=p.parse_args(); rows=[]
    if a.head:
        # Two sequential requests per page/UA, not a cache-busting request.
        for path in ['/', '/didi-in-china-for-foreigners/']:
            for ua in ['Mozilla/5.0','Googlebot']:
                for n in [1,2]:
                    headers,body,raw=curl(path,ua,True)
                    rows.append({'path':path,'ua':ua,'run':n,'cf-cache-status':headers.get('cf-cache-status','ABSENT'),'age':headers.get('age','ABSENT'),'cache-control':headers.get('cache-control','ABSENT'),'raw_headers':raw})
    else:
        def compare(path):
            h,b,_=curl(path,'Googlebot');ch,cb,_=curl(path+'?cb='+str(time.time_ns()),'Googlebot')
            return {'path':path,'identical':b==cb,'plain_sha256':hashlib.sha256(b).hexdigest(),'cb_sha256':hashlib.sha256(cb).hexdigest(),'bytes':len(b),'cf-cache-status':h.get('cf-cache-status','ABSENT'),'age':h.get('age','ABSENT'),'cache-control':h.get('cache-control','ABSENT'),'cb-cache-control':ch.get('cache-control','ABSENT')}
        with ThreadPoolExecutor(max_workers=4) as pool:
            rows=list(pool.map(compare,['/','/pricing/','/amap-english-mode-guide-2026/','/didi-in-china-for-foreigners/']))
        if a.require_plan_placement:
            h,b,_=curl('/plan/','Googlebot');html=b.decode();box=html.find('data-planning-help-box');disclaimer=html.find('ChinaEase Buddy is a digital travel toolkit.')
            rows.append({'path':'/plan/','no_query':True,'linbox_before_disclaimer':0<=box<disclaimer,'cache-control':h.get('cache-control','ABSENT'),'cf-cache-status':h.get('cf-cache-status','ABSENT'),'age':h.get('age','ABSENT'),'sha256':hashlib.sha256(b).hexdigest()})
    report={'utc':datetime.now(timezone.utc).isoformat(),'origin':ORIGIN,'mode':'HEAD' if a.head else 'GET','rows':rows}
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
    if any(row.get('identical') is False or row.get('linbox_before_disclaimer') is False for row in rows):
        raise SystemExit(1)
if __name__=='__main__':main()
