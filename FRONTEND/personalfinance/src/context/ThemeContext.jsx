import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('financeTheme') === 'dark';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        document.body.classList.add('bg-mesh-gradient');
        localStorage.setItem('financeTheme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggle = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
