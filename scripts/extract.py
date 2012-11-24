'''Take Mongo dump items, uncompress back to HTML'''
import csv
import zlib
import binascii
import os
import re
import json
import collections

fp = 'cache/dumps.csv'
outdir = 'cache/dumps'
if not os.path.exists(outdir):
    os.makedirs(outdir)

index = collections.defaultdict(list)

for count, row in enumerate(csv.DictReader(open(fp))):
    data = binascii.unhexlify(row['zhtml'])
    docid = row['doc_id']
    docdir = os.path.join(outdir, docid)
    try:
        uncompressed = zlib.decompress(data)
        # page title
        # out = re.findall('<title>(.*)</title>', uncompressed)
        out = re.findall('<li class="activated"><div>\s+<a[^>]*>([^<]*)</a>', uncompressed,
                re.MULTILINE)
        pagetab = out[0].strip().lower().replace(' ', '')
        if pagetab == 'summary':
            index[docid].append(pagetab)
            if not os.path.exists(docdir):
                os.makedirs(docdir)
            outpath = os.path.join(docdir, pagetab + '.html')
            open(outpath, 'w').write(uncompressed)
    except zlib.error:
        print 'had error with ' + row['doc_id']
    if count > 100000:
        break

indexpath = os.path.join(outdir, 'index.json')
json.dump(index, open(indexpath, 'w'), indent=2, sort_keys=True)
