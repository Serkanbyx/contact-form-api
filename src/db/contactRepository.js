const { getDatabase } = require("./database");

const contactRepository = {
  create({ name, email, message, ipAddress }) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO contacts (name, email, message, ip_address)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, message, ipAddress);
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
  },

  findAll({ page = 1, limit = 20 } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    const rows = db
      .prepare("SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .all(limit, offset);

    const { total } = db.prepare("SELECT COUNT(*) AS total FROM contacts").get();

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  deleteById(id) {
    const db = getDatabase();
    const result = db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

module.exports = contactRepository;
