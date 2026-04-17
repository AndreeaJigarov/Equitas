/* pages/StatisticsPage/StatisticsPage.tsx */
import { DifficultyDistribution } from '../../components/StatisticsComponents/DifficultyDistribution';
import styles from './StatisticsPage.module.css';
import {getSessionDuration} from "../../utils/CookieUtils.ts";

export const StatisticsPage = () => {
    const handleGenerate = () => {
        // We will wire this up to the faker logic next!
        console.log("Generating...");
    };

    const sessionTime = getSessionDuration();

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statsHeader}>
                <h1 className={styles.title}>Horse Analytics</h1>
                <p className={styles.sessionInfo}>Current Session: {sessionTime}</p>
            </div>

            {/* Our isolated logic component */}
            <DifficultyDistribution />

            {/* Future components :
      <BreedStatistics />
      <AgeDemographics />
      */}

            <div className={styles.footer}>
                <button className={styles.btnGenerate} onClick={handleGenerate}>
                    Generate Random Horse
                </button>
            </div>
        </div>
    );
};