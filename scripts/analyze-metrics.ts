import * as fs from "fs";
import * as path from "path";

const logPath = path.resolve(process.cwd(), "..", "..", "brain", "e5caa118-b909-495b-8320-e988de8987a6", ".system_generated", "tasks", "task-3561.log");

function analyze() {
  const content = fs.readFileSync(logPath, "utf-8");
  const startIdx = content.indexOf("TRACE_RESULTS_JSON_START");
  const endIdx = content.indexOf("TRACE_RESULTS_JSON_END");

  if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find JSON markers in log file.");
    return;
  }

  const jsonStr = content.substring(startIdx + "TRACE_RESULTS_JSON_START".length, endIdx).trim();
  const rows = JSON.parse(jsonStr);

  const activeAssets = rows.filter((r: any) => r.dbImage !== null);
  const sizes = activeAssets.map((r: any) => parseInt(r.contentLength, 10));
  sizes.sort((a: number, b: number) => a - b);

  const sum = sizes.reduce((acc: number, v: number) => acc + v, 0);
  const totalMb = sum / (1024 * 1024);

  const getPercentile = (p: number) => {
    const idx = Math.ceil((p / 100) * sizes.length) - 1;
    return sizes[idx];
  };

  const median = getPercentile(50);
  const p75 = getPercentile(75);
  const p90 = getPercentile(90);

  console.log(`TOTAL ACTIVE ASSETS: ${activeAssets.length}`);
  console.log(`TOTAL TRANSFER SIZE: ${totalMb.toFixed(2)} MB`);
  console.log(`MEDIAN SIZE: ${(median / 1024).toFixed(1)} KB`);
  console.log(`P75 SIZE: ${(p75 / 1024).toFixed(1)} KB`);
  console.log(`P90 SIZE: ${(p90 / 1024).toFixed(1)} KB`);

  // Largest 10 assets
  const sortedByDescSize = [...activeAssets].sort((a, b) => parseInt(b.contentLength, 10) - parseInt(a.contentLength, 10));
  console.log("\nLARGEST 10 PRODUCT ASSETS:");
  sortedByDescSize.slice(0, 10).forEach((a, i) => {
    console.log(`${i+1}. ${a.slug} (${a.category}): ${(parseInt(a.contentLength, 10) / 1024).toFixed(1)} KB`);
  });

  const above500 = activeAssets.filter((a: any) => parseInt(a.contentLength, 10) > 500 * 1024);
  const above1000 = activeAssets.filter((a: any) => parseInt(a.contentLength, 10) > 1024 * 1024);

  console.log(`\nASSETS ABOVE 500 KB: ${above500.length}`);
  above500.forEach((a: any) => console.log(`  - ${a.slug}: ${(parseInt(a.contentLength, 10)/1024).toFixed(1)} KB`));
  
  console.log(`\nASSETS ABOVE 1 MB: ${above1000.length}`);
}

analyze();
