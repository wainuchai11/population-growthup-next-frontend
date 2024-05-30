import Image from "next/image";
import styles from "./page.module.css";
import BarChart from "./components/BarChart/BarChart";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Population growth per country, 1950 to 2021
      </h1>
      <BarChart />
    </div>
  );
}
