TODO: some more info

## Getting the data out of the mongo db

`mongoexport --host opented.org --db opented --username iacc --password gohack --collection dumps --csv --fields "zhtml,doc_id,timestamp" | head -n 5000 > tmp.csv`
