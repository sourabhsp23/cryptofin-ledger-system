import ShaderBackground from "./ui/shader-background"
import { useTheme } from "./ThemeProvider"

export function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return (
    <div className="fixed inset-0 -z-10">
      {isDark ? (
        <ShaderBackground />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent"></div>
        </div>
      )}
    </div>
  );
}
