import { execSync } from 'child_process';
try {
  const out = execSync('npx next build', { encoding: 'utf-8' });
  console.log("SUCCESS:", out);
} catch(e) {
  console.error("FAIL:", e.stdout);
  console.error("ERR:", e.stderr);
}
