TODO: some more info

## Data Processing Pipeline

Structured data is in a MongoDB at opented.org/opented

Unstructured cached HTML pages are also in the that DB in a collection called dumps (in future this data should probably go direct to s3!).

### 1. Get dumps onto s3

Get data out of mongodb:

    mongoexport --host opented.org --db opented --username iacc --password gohack --collection dumps --csv --fields "zhtml,doc_id,timestamp" | head -n 5000 > cache/dumps.csv

Then use extract.py:

    python scripts/extract.py

This will produce a whole bunch of files in `cache/dumps`

Now push these to s3:

    s3cmd sync --acl-public cache/dumps/ s3://files.opented.org/scraped/

You will find the index of files at: <http://files.opented.org.s3.amazonaws.com/scraped/index.json>

### 2. Scraping content

Now it's time to scrape some content!

We've written a nodejs scraper. You will need to install the dependencies first:

    npm install cheerio requests

Then do:

    node scripts/scraper.js

Data will be written to cache/dumps/{docid}/extracted.json

