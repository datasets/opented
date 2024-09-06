Processing code and information related to OpenTED (Tenders Electronic Daily).

## Data Processing Pipeline

Structured data is in a MongoDB at opented.org/opented

Unstructured cached HTML pages are also in the that DB in a collection called dumps (in future this data should probably go direct to s3!).

### 1. Get dumps onto s3

#### Get data out of mongodb.

    mongoexport --host opented.org --db opented --username iacc --password gohack --collection dumps --csv --fields "zhtml,doc_id,timestamp" | head -n 5000 > cache/dumps.csv

#### Decompress the HTML

    python scripts/extract.py

This will produce a whole bunch of files in `cache/dumps`

#### Upload the decompressed HTML to S3

    s3cmd sync --acl-public cache/dumps/ s3://files.opented.org/scraped/

You will find the index of files at: http://files.opented.org.s3.amazonaws.com/scraped/index.json


### 2. Scraping content

Now it's time to scrape some content!

We've written a nodejs scraper. You will need to install the dependencies first:

    npm install cheerio request

Then do:

    node scripts/scrape.js

Data will be written to cache/dumps/{docid}/extracted.json


## Wishlist

Extra fields to scrape:

* VAT inclusion (string e.g. "Including VAT", "Excluding VAT", "Including 10% VAT", etc.)
* Award criteria (string, often multi-line, outlining criteria for choosing this bidder)

We also need to cover the scenario of one contract having multiple winners.

This probably means we're aiming for three content tables in the end (possibly not with these names):

* `contracts` (need a better name) - info about a specific 
* `companies` - info about a company
* `wins` - the relation table, i.e. a record in this table has a contract_id and a company_id. Also we can add extra info here that applies to a contract–company relation, eg the proportion of the total contract fee won by this company.


## UPDATE from Callum

I attempted to get the entire database by running `mongoexport` overnight (piping through `pv` so I could see the progress), and this morning it's only at 43%, after running for 12.5 hours. I think it's stuck, it doesn't seem to be moving. 

I've cancelled this now in case it's DOSing the database. I could still run the Python decompression script on the dumps I've got and upload straight to S3 (could leave this running while I'm out today), but it might take ages. Let me know if you want me to try that, or something else - `callum.locke` at gmail. 
