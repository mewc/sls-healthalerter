'use strict';
const request = require('axios');
const { extractHealthData } = require('./helpers');
const { updateDb } = require('./db');

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};

const url = 'https://www.health.gov.au/news/health-alerts/novel-coronavirus-2019-ncov-health-alert/coronavirus-covid-19-current-situation-and-case-numbers';
module.exports.covid19alerter = (event, context, callback) => {
  request(url)
    .then(({ data }) => {
      const figures = extractHealthData(data);
      let date = new Date();
      date = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
      console.log(figures);
      updateDb({ date, ...figures })
        .then(r => {
          console.log(r);
        })
        .catch(err => {
          console.log(err);
        })
      callback(null, figures);
    })
    .catch(callback);
};
