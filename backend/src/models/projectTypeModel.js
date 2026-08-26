const pool = require("../db");

function asTypologies(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function findAll() {
  const result = await pool.query(
    `select
       pt.code,
       pt.description_en,
       pt.description_es,
       coalesce(
         jsonb_agg(
           jsonb_build_object(
             'id', t.id,
             'description_en', t.description_en,
             'description_es', t.description_es
           )
           order by t.id
         ) filter (where t.id is not null),
         '[]'::jsonb
       ) as typologies
     from catalog.project_types pt
     left join config.project_types_typologies map
       on map.project_type_code = pt.code
      and map.is_hidden = false
     left join catalog.typologies t
       on t.id = map.typology_id
      and t.is_hidden = false
     where pt.is_hidden = false
     group by pt.code, pt.description_en, pt.description_es
     order by pt.code`,
  );
  return result.rows.map((row) => ({
    ...row,
    typologies: asTypologies(row.typologies),
  }));
}

module.exports = {
  findAll,
};
