/* components/Statistics/DifficultyDistribution.tsx */
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useHorseStore } from '../../store/useHorseStore';
import styles from '../../pages/StatisticsPage/StatisticsPage.module.css'; // Reusing existing styles

export const DifficultyDistribution = () => {
    const horses = useHorseStore((state) => state.horses);

    // Live calculation based on store state
    const data = [
        { name: 'Easy', value: horses.filter(h => h.difficulty === 'Easy').length, color: '#5C6B4A' },
        { name: 'Medium', value: horses.filter(h => h.difficulty === 'Medium').length, color: '#A68A64' },
        { name: 'Hard', value: horses.filter(h => h.difficulty === 'Hard').length, color:  '#8B5E3C'},
    ];

    return (
        <div className={styles.chartGrid}>
            {/* Chart A: Pie Distribution */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Difficulty Distribution(PIE)</h3>
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart B: Bar Metrics */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Difficulty Distribution(GRAPHIC)</h3>
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{fill: 'transparent'}}/>
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};