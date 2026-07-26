const db = require('../config/db');

const TABLE = 'notes';

const BASE_COLUMNS = [
  'notes.id',
  'notes.title',
  'notes.description',
  'notes.file_type',
  'notes.page_count',
  'notes.size_bytes',
  'notes.status',
  'notes.subject_id',
  'notes.created_at',
  'notes.updated_at'
];

module.exports = {
  async findBySubjectId(subjectId, params) {
    const query = db(TABLE)
      .select(BASE_COLUMNS)
      .where('subject_id', subjectId)
      .andWhere('status', 'published')
      .orderBy('created_at', 'desc');

    if (params && params.limit) {
      query.limit(params.limit).offset(params.offset || 0);
    }
    return query;
  },

  async countBySubjectId(subjectId) {
    const result = await db(TABLE)
      .where('subject_id', subjectId)
      .andWhere('status', 'published')
      .count('id as count')
      .first();
    return Number(result.count);
  },

  async findRecent(limit) {
    return db(TABLE)
      .join('subjects', 'subjects.id', 'notes.subject_id')
      .select(BASE_COLUMNS.concat(['subjects.name as subject_name']))
      .where('notes.status', 'published')
      .orderBy('notes.created_at', 'desc')
      .limit(limit || 5);
  },

  async findById(id) {
    return db(TABLE)
      .join('subjects', 'subjects.id', 'notes.subject_id')
      .join('semesters', 'semesters.id', 'subjects.semester_id')
      .join('years', 'years.id', 'semesters.year_id')
      .leftJoin('users', 'users.id', 'notes.uploaded_by')
      .select(
        BASE_COLUMNS.concat([
          'subjects.name as subject_name',
          'semesters.label as semester_label',
          'semesters.id as semester_id',
          'years.label as year_label',
          'years.id as year_id',
          'users.name as uploaded_by_name'
        ])
      )
      .where('notes.id', id)
      .first();
  },

  async findRawById(id) {
    return db(TABLE).where({ id: id }).first();
  },

  async search(query, params) {
    const like = '%' + query + '%';
    const builder = db(TABLE)
      .join('subjects', 'subjects.id', 'notes.subject_id')
      .select(BASE_COLUMNS.concat(['subjects.name as subject_name']))
      .where('notes.status', 'published')
      .andWhere(function () {
        this.whereILike('notes.title', like)
          .orWhereILike('notes.description', like)
          .orWhereILike('subjects.name', like);
      })
      .orderBy('notes.created_at', 'desc');

    if (params && params.limit) {
      builder.limit(params.limit).offset(params.offset || 0);
    }
    return builder;
  },

  async countSearch(query) {
    const like = '%' + query + '%';
    const result = await db(TABLE)
      .join('subjects', 'subjects.id', 'notes.subject_id')
      .where('notes.status', 'published')
      .andWhere(function () {
        this.whereILike('notes.title', like)
          .orWhereILike('notes.description', like)
          .orWhereILike('subjects.name', like);
      })
      .count('notes.id as count')
      .first();
    return Number(result.count);
  },

  async create(data) {
    const rows = await db(TABLE)
      .insert({
        subject_id: data.subjectId,
        title: data.title,
        description: data.description || null,
        drive_file_id: data.driveFileId,
        file_type: data.fileType || 'pdf',
        page_count: data.pageCount || null,
        size_bytes: data.sizeBytes || null,
        status: data.status || 'published',
        uploaded_by: data.uploadedBy
      })
      .returning('*');
    return rows[0];
  },

  async update(id, data) {
    const rows = await db(TABLE)
      .where({ id: id })
      .update({
        title: data.title,
        description: data.description,
        status: data.status,
        updated_at: db.fn.now()
      })
      .returning('*');
    return rows[0];
  },

  async remove(id) {
    return db(TABLE).where({ id: id }).del();
  },

  async listForAdmin(params) {
    const query = db(TABLE)
      .join('subjects', 'subjects.id', 'notes.subject_id')
      .select(BASE_COLUMNS.concat(['subjects.name as subject_name']))
      .orderBy('notes.created_at', 'desc');

    if (params && params.search) {
      query.andWhere(function () {
        this.whereILike('notes.title', '%' + params.search + '%');
      });
    }
    if (params && params.limit) {
      query.limit(params.limit).offset(params.offset || 0);
    }
    return query;
  },

  async countForAdmin(params) {
    const query = db(TABLE);
    if (params && params.search) {
      query.whereILike('title', '%' + params.search + '%');
    }
    const result = await query.count('id as count').first();
    return Number(result.count);
  },

  async countAll() {
    const result = await db(TABLE).count('id as count').first();
    return Number(result.count);
  },

  async sumSizeBytes() {
    const result = await db(TABLE).sum('size_bytes as total').first();
    return Number(result.total) || 0;
  }
};
