'''Take Mongo dump items, uncompress back to HTML'''
import csv
import zlib
import binascii
import os

fp = 'cache/dumps.csv'
outdir = 'cache/dumps'
if not os.path.exists(outdir):
    os.makedirs(outdir)

for count,row in enumerate(csv.DictReader(open(fp))):
    data = binascii.unhexlify(row['zhtml'])
    try: 
        uncompressed = zlib.decompress(data)
        outpath = os.path.join(outdir, row['doc_id'] + '.html')
        open(outpath, 'w').write(uncompressed)
    except:
        print 'had error with ' + row['doc_id']
    if count > 500:
        break
    
