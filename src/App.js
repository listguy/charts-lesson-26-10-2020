import logo from "./logo.svg";
import { useEffect, useState } from "react";
import "./App.css";
import {
  LineChart,
  Tooltip,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
} from "recharts";
function App() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([
    { loading: 0, loading: 0, loading: 0 },
  ]);
  const [pieData, setPieData] = useState([{}]);
  const [firstCountryIndex, setFirstCountryIndex] = useState(1);
  const [secondCountryIndex, setSecondCountryIndex] = useState(2);
  const [firstCountryKey, setFirstCountryKey] = useState("Loading");
  const [secondCountryKey, setSecondCountryKey] = useState("Loading");

  useEffect(() => {
    if (!data[0]) return;
    const firstCountry = data[firstCountryIndex];
    const secondCountry = data[secondCountryIndex];
    const key1 = `${firstCountry["Country/Region"]}, ${firstCountry["Province/State"]}`;
    const key2 = `${secondCountry["Country/Region"]}, ${secondCountry["Province/State"]}`;
    const newData = Object.entries(firstCountry)
      .filter(([key, value]) => /\d/.test(key))
      .map(([key, value]) => {
        return { date: key, [key1]: value, [key2]: secondCountry[key] };
      });
    setFirstCountryKey(key1);
    setSecondCountryKey(key2);
    setChartData(newData);
  }, [firstCountryIndex, secondCountryIndex, data]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
    )
      .then((response) => response.text())
      .then((data) => {
        const keys = data.slice(0, data.indexOf("\n")).split(",");
        const parsedData = data
          .split("\n")
          .map((row) =>
            row
              .split(",")
              .map((value, i) => [keys[i], value])
              .reduce((res, pair) => {
                res[pair[0]] = /\d/.test(pair[1]) ? parseInt(pair[1]) : pair[1];
                return res;
              }, {})
          )
          .slice(1);
        const newPieData = [
          {
            name: "10,000 or less",
            max: 10000,
            amt: 0,
          },
          {
            name: "10,001 - 50,000",
            max: 50000,
            amt: 0,
          },
          {
            name: "50,001 - 250,000",
            max: 250000,
            amt: 0,
          },
          {
            name: "250,001 - 500,000",
            max: 500000,
            amt: 0,
          },
          {
            name: "500,001 or more",
            max: Infinity,
            amt: 0,
          },
        ];

        parsedData.forEach((countreyData) => {
          countreyData = Object.values(countreyData);

          const latestCaseNumber = countreyData[countreyData.length - 1];

          for (let obj of newPieData) {
            if (latestCaseNumber <= obj.max) {
              obj.amt += 1;
              break;
            }
          }
        });

        setPieData(newPieData);
        setData(parsedData);
        setFirstCountryKey(
          `${Object.values(parsedData[firstCountryIndex])[1]}, ${
            Object.values(parsedData[firstCountryIndex])[0]
          }`
        );
        setSecondCountryKey(
          `${Object.values(parsedData[secondCountryIndex])[1]}, ${
            Object.values(parsedData[secondCountryIndex])[0]
          }`
        );
      });
  }, []);

  return (
    <div name="App">
      <h1>Compare cases in two countries</h1>
      <LineChart
        width={600}
        height={300}
        data={chartData}
        style={{ marginBottom: "40px" }}
      >
        <Line type="monotone" dataKey={firstCountryKey} stroke="black" />
        <Line type="monotone" dataKey={secondCountryKey} stroke="green" />

        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Legend />
      </LineChart>

      <select
        id="first-country-selector"
        onChange={(e) => setFirstCountryIndex(e.target.value)}
        value={firstCountryIndex}
      >
        {data.map((countryObject, i) => (
          <option value={i}>
            {`${countryObject["Country/Region"]}, ${countryObject["Province/State"]}`}
          </option>
        ))}
      </select>
      <select
        id="second-country-selector"
        onChange={(e) => setSecondCountryIndex(e.target.value)}
        value={secondCountryIndex}
      >
        {" "}
        {data.map((countryObject, i) => (
          <option value={i}>
            {`${countryObject["Country/Region"]}, ${countryObject["Province/State"]}`}
          </option>
        ))}
      </select>
      <h1>Number of cases by range</h1>
      <PieChart width={400} height={400}>
        <Pie dataKey="amt" nameKey="name" data={pieData} fill="#82ca9d" label />
        <Tooltip />
      </PieChart>
    </div>
  );
}

export default App;
