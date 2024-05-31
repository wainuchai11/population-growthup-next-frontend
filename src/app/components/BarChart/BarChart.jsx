"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const BarChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 800,
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 1000,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 1000,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          colors: {
            ranges: [
              { from: 0, to: 100000000, color: "#f44336" },
              { from: 100000001, to: 200000000, color: "#ffeb3b" },
              { from: 200000001, to: 500000000, color: "#4caf50" },
              { from: 500000001, to: 1000000000, color: "#2196f3" },
              { from: 1000000001, to: 6000000000, color: "#9c27b0" },
            ],
          },
        },
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return val.toLocaleString();
          },
        },
      },
      yaxis: {
        title: {
          text: "Country",
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString();
          },
        },
      },
      title: {
        text: "",
      },
      legend: {
        show: true,
        position: "bottom",
        onItemClick: {
          toggleDataSeries: true,
        },
      },
    },
  });

  const [yearIndex, setYearIndex] = useState(0);
  const dataRef = useRef([]);
  const worldDataRef = useRef([]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/populationDemography`)
      .then((response) => {
        const transformedData = transformData(response.data);
        dataRef.current = transformedData.countries;
        worldDataRef.current = transformedData.world;
        setYearIndex(0);
        updateChartData(dataRef.current, 0);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dataRef.current.length > 0) {
        const nextIndex = (yearIndex + 1) % dataRef.current.length;
        setYearIndex(nextIndex);
        updateChartData(dataRef.current, nextIndex);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [yearIndex]);

  const transformData = (data) => {
    let transformedCountriesData = [];
    let transformedWorldData = [];

    data.forEach((entry) => {
      if (entry.country_name === "World") {
        entry.populations.forEach((pop, index) => {
          if (!transformedWorldData[index]) {
            transformedWorldData[index] = {
              year: entry.years[index],
              data: [],
            };
          }
          transformedWorldData[index].data.push({
            name: "World",
            population: pop,
          });
        });
      } else {
        entry.populations.forEach((pop, index) => {
          if (!transformedCountriesData[index]) {
            transformedCountriesData[index] = {
              year: entry.years[index],
              data: [],
            };
          }
          transformedCountriesData[index].data.push({
            name: entry.country_name,
            population: pop,
          });
        });
      }
    });

    return { countries: transformedCountriesData, world: transformedWorldData };
  };

  const updateChartData = (data, index) => {
    const yearData = data[index];
    const sortedData = yearData.data
      .sort((a, b) => b.population - a.population)
      .slice(0, 20);
    const categories = sortedData.map((d) => d.name);
    const values = sortedData.map((d) => d.population);

    setChartData((prevData) => ({
      series: [{ name: "Population", data: values }],
      options: {
        ...prevData.options,
        xaxis: {
          categories: categories,
        },
        title: {
          text: `Population growth in ${yearData.year}`,
        },
      },
    }));
  };

  const toggleWorldData = () => {
    if (dataRef.current === worldDataRef.current) {
      setYearIndex(0);
      updateChartData(dataRef.current, 0);
    } else {
      setYearIndex(0);
      updateChartData(worldDataRef.current, 0);
    }
  };

  return (
    <div id="chart">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={600}
        width={1000}
      />
      <div
        className="legend"
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          onClick={toggleWorldData}
          style={{
            backgroundColor:
              dataRef.current === worldDataRef.current ? "lightgray" : "white",
            margin: "0 10px",
            padding: "10px",
            cursor: "pointer",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          {dataRef.current === worldDataRef.current
            ? "Show Countries"
            : "Show World"}
        </button>
      </div>
    </div>
  );
};

export default BarChart;
