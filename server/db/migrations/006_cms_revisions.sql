-- Keep an immutable snapshot of editorial changes for traceability and rollback review.
-- This does not snapshot private family records or account data.
CREATE TABLE IF NOT EXISTS cms_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('article','feature_content')),
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('created','updated','deleted')),
  snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_entity ON cms_revisions(entity_type, entity_id, created_at DESC);

CREATE TRIGGER IF NOT EXISTS articles_revision_insert
AFTER INSERT ON articles
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('article', NEW.id, 'created', json_object(
    'title', NEW.title, 'slug', NEW.slug, 'excerpt', NEW.excerpt,
    'content', NEW.content, 'category', NEW.category, 'status', NEW.status,
    'meta_title', NEW.meta_title, 'meta_description', NEW.meta_description,
    'author_name', NEW.author_name, 'reviewer_name', NEW.reviewer_name,
    'source_notes', NEW.source_notes
  ));
END;

CREATE TRIGGER IF NOT EXISTS articles_revision_update
AFTER UPDATE ON articles
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('article', NEW.id, 'updated', json_object(
    'title', NEW.title, 'slug', NEW.slug, 'excerpt', NEW.excerpt,
    'content', NEW.content, 'category', NEW.category, 'status', NEW.status,
    'meta_title', NEW.meta_title, 'meta_description', NEW.meta_description,
    'author_name', NEW.author_name, 'reviewer_name', NEW.reviewer_name,
    'source_notes', NEW.source_notes
  ));
END;

CREATE TRIGGER IF NOT EXISTS articles_revision_delete
BEFORE DELETE ON articles
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('article', OLD.id, 'deleted', json_object(
    'title', OLD.title, 'slug', OLD.slug, 'excerpt', OLD.excerpt,
    'content', OLD.content, 'category', OLD.category, 'status', OLD.status,
    'meta_title', OLD.meta_title, 'meta_description', OLD.meta_description,
    'author_name', OLD.author_name, 'reviewer_name', OLD.reviewer_name,
    'source_notes', OLD.source_notes
  ));
END;

CREATE TRIGGER IF NOT EXISTS feature_content_revision_insert
AFTER INSERT ON feature_content
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('feature_content', NEW.id, 'created', json_object(
    'content_type', NEW.content_type, 'title', NEW.title, 'slug', NEW.slug,
    'summary', NEW.summary, 'body', NEW.body, 'category', NEW.category,
    'min_age_months', NEW.min_age_months, 'max_age_months', NEW.max_age_months,
    'author_name', NEW.author_name, 'reviewer_name', NEW.reviewer_name,
    'source_notes', NEW.source_notes, 'status', NEW.status
  ));
END;

CREATE TRIGGER IF NOT EXISTS feature_content_revision_update
AFTER UPDATE ON feature_content
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('feature_content', NEW.id, 'updated', json_object(
    'content_type', NEW.content_type, 'title', NEW.title, 'slug', NEW.slug,
    'summary', NEW.summary, 'body', NEW.body, 'category', NEW.category,
    'min_age_months', NEW.min_age_months, 'max_age_months', NEW.max_age_months,
    'author_name', NEW.author_name, 'reviewer_name', NEW.reviewer_name,
    'source_notes', NEW.source_notes, 'status', NEW.status
  ));
END;

CREATE TRIGGER IF NOT EXISTS feature_content_revision_delete
BEFORE DELETE ON feature_content
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('feature_content', OLD.id, 'deleted', json_object(
    'content_type', OLD.content_type, 'title', OLD.title, 'slug', OLD.slug,
    'summary', OLD.summary, 'body', OLD.body, 'category', OLD.category,
    'min_age_months', OLD.min_age_months, 'max_age_months', OLD.max_age_months,
    'author_name', OLD.author_name, 'reviewer_name', OLD.reviewer_name,
    'source_notes', OLD.source_notes, 'status', OLD.status
  ));
END;
