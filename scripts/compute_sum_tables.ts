import { writeFileSync } from "fs";
import { precompute } from "../lib/tables";

function serializePoint(point: any) {
  if (point.inf) {
    return [null, null];
  }
  return [point.getX().toString(16), point.getY().toString(16)];
}

async function main() {
  const tables = precompute();

  const serialized = tables.map((points) => points.map(serializePoint));

  writeFileSync(
    "/tmp/tables.json",
    JSON.stringify(serialized, undefined, "  ")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
