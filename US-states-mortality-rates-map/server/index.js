const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;
const { DATA_MEDICARE_GOV_APP_TOKEN } = require('../config.js');

app.use(express.static(__dirname + "/../client/dist"));

const stateAverage = arr => {
  let count = 0;
  let total = 0;
  arr.forEach(e => {
    if (e.score !== "Not Available") {
      total += Number(e.score);
      count++;
    }
  });
  const avg = Math.round(total / count);
  return {
    mortalityScore: avg
  };
};

const average = obj => {
  let result = {};
  for (let keys in obj) {
    result[keys] = stateAverage(obj[keys]);
  }
  return result;
};

const dataClean = function(array) {
  const stateCheck = s => {
    if ( s === "AS" || s === "DC" || s === "GU" || s === "MP" || s === "PR" || s === "VI" || s === undefined) {
      return false;
    }
    return true;
  };

  const Score = s => {
    if (s === undefined) {
      return false;
    }
    return true;
  };

  const result = {};

  array.forEach(e => {
    const { state, score } = e;
    if (!stateCheck(state) || !Score(score)) {
      return;
    }
    if (!result[state]) {
      result[state] = [];
      result[state].push(e);
    }
    if (result[state]) {
      result[state].push(e);
    }
  });
  return result;
};

app.get("/api/heartFailures", (req, res) => {
  let options = {
    headers: {
      "X-App-Token": DATA_MEDICARE_GOV_APP_TOKEN
    }
  };
  axios
    .get("https://data.medicare.gov/resource/ukfj-tt6v.json", options)
    .then(results => {
      const filteredData = dataClean(results.data);
      res.send(average(filteredData));
    })
    .catch(err => {
      res.send(err);
    });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
