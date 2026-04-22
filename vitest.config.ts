import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: [
                'src/utils/Validation.ts',
                'src/utils/CookieUtils.ts',
                'src/store/useHorseStore.ts',
                'src/components/AuthComponents/RegisterForm.tsx',
                'src/components/AuthComponents/LoginForm.tsx',
                'src/components/HorsesComponents/HorseDetailView/HorseDetailView.tsx',
                'src/components/HorsesComponents/HorseForm/HorseForm.tsx',
                'src/components/HorsesComponents/HorseTable/HorseTable.tsx',
            ],
            exclude: [
                'src/**/*.module.css',
                'src/assets/**',
                'src/main.tsx',
                'src/types/**',
                'src/components/NavBar/**',
                'src/components/StatisticsComponents/**',
                'src/components/HorsesComponents/AnimatedHorse/**',
                'src/pages/**',
                'src/layouts/**',
            ],
        },
    },
});