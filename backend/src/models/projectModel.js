const pool = require("../db");
const { publicImageUrl } = require("../lib/storageUrl");

function withImageUrl(row) {
  if (!row) {
    return row;
  }
  return {
    ...row,
    image_url: publicImageUrl(row.bucket_name, row.path_name),
    icon_url: publicImageUrl(row.icon_bucket_name, row.icon_path_name),
  };
}

const WRITABLE_COLUMNS = [
  "title",
  "project_type_code",
  "location_id",
  "typology_id",
  "person_id",
  "status_code",
  "final_date",
  "image_file_content_id",
  "icon_file_content_id",
  "is_hidden",
  "created_by",
  "modified_by",
];

function pickWritable(data = {}) {
  const payload = {};
  for (const column of WRITABLE_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(data, column)) {
      payload[column] = data[column];
    }
  }
  return payload;
}

async function findAll() {
  const result = await pool.query(
    `select *
     from entity.projects_v
     where is_hidden = false
     order by final_date desc, created_at desc`,
  );
  return result.rows.map(withImageUrl);
}

async function findById(id) {
  const result = await pool.query(
    `select *
     from entity.projects_v
     where id = $1`,
    [id],
  );
  return withImageUrl(result.rows[0] ?? null);
}

async function create(data) {
  const payload = pickWritable(data);

  if (
    !payload.title ||
    payload.project_type_code == null ||
    payload.location_id == null ||
    payload.typology_id == null ||
    payload.image_file_content_id == null ||
    payload.icon_file_content_id == null
  ) {
    const error = new Error(
      "title, project_type_code, location_id, typology_id, image_file_content_id, and icon_file_content_id are required",
    );
    error.statusCode = 400;
    throw error;
  }

  const columns = Object.keys(payload);
  const values = Object.values(payload);
  const placeholders = columns.map((_, index) => `$${index + 1}`);

  const result = await pool.query(
    `insert into entity.projects_v (${columns.join(", ")})
     values (${placeholders.join(", ")})
     returning *`,
    values,
  );
  return withImageUrl(result.rows[0]);
}

async function update(id, data) {
  const existing = await findById(id);
  if (!existing) {
    return null;
  }

  const payload = pickWritable({ ...existing, ...pickWritable(data) });
  const columns = Object.keys(payload);
  const values = Object.values(payload);
  const setClause = columns
    .map((column, index) => `${column} = $${index + 1}`)
    .join(", ");

  const result = await pool.query(
    `update entity.projects_v
     set ${setClause}
     where id = $${columns.length + 1}
     returning *`,
    [...values, id],
  );
  return withImageUrl(result.rows[0] ?? null);
}

async function remove(id) {
  return update(id, { is_hidden: true });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
