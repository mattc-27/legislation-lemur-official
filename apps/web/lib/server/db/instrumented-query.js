// modules/db/instrumented-query.js
import { pool } from "./db";

const ENABLE = process.env.DB_TIMING === "1";   // turn on in dev: DB_TIMING=1
const NS_TO_MS = 1e6;

export async function q(label, text, params = []) {
  const started = process.hrtime.bigint();
  let err, res;

  try {
    res = await pool.query(text, params);
    return res;
  } catch (e) {
    err = e;
    throw e;
  } finally {
    if (ENABLE) {
      const elapsedMs =
        Number(process.hrtime.bigint() - started) / NS_TO_MS;

      // keep logs one-line & parseable
      /*      console.log(
              JSON.stringify({
                msg: "db",
                label,
                duration_ms: Math.round(elapsedMs * 1000) / 1000,
                row_count: res?.rowCount ?? 0,
                ok: !err,
              })
            ); */
    }
  }
}

// Optional: on-demand EXPLAIN for a given statement
export async function qExplain(label, text, params = []) {
  const explainSQL = `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) ${text}`;
  const { rows } = await pool.query(explainSQL, params);

  /*  console.log(
     JSON.stringify({
       msg: "db.explain",
       label,
       plan: rows?.[0]?.["QUERY PLAN"]?.[0],
     })
   );*/
}
