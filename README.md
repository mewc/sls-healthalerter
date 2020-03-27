# sls health alerter

Using serverless.com framework. 

Create a Lambda that gets triggered every 2 hours. Will scrape the au gov site and structure the data properly.
Push data to Dynamo.


## getting started

Install at serverless.com 

Run the lambda locally

`sls invoke local --function covid19alerter`


deploy to aws

`sls deploy`

## Author

mewc