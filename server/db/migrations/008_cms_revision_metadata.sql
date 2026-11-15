DROP TRIGGER IF EXISTS feature_content_revision_insert;
DROP TRIGGER IF EXISTS feature_content_revision_update;
DROP TRIGGER IF EXISTS feature_content_revision_delete;
CREATE TRIGGER feature_content_revision_insert
AFTER INSERT ON feature_content
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('feature_content', NEW.id, 'created', json_object(
    'content_type', NEW.content_type, 'title', NEW.title, 'slug', NEW.slug,
    'summary', NEW.summary, 'body', NEW.body, 'category', NEW.category,
    'min_age_months', NEW.min_age_months, 'max_age_months', NEW.max_age_months,
    'author_name', NEW.author_name, 'reviewer_name', NEW.reviewer_name,
    'source_notes', NEW.source_notes, 'source_title', NEW.source_title,
    'source_pages', NEW.source_pages, 'reviewed_at', NEW.reviewed_at,
    'sort_order', NEW.sort_order, 'status', NEW.status
  ));
END;
CREATE TRIGGER feature_content_revision_update
AFTER UPDATE ON feature_content
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('feature_content', NEW.id, 'updated', json_object(
    'content_type', NEW.content_type, 'title', NEW.title, 'slug', NEW.slug,
    'summary', NEW.summary, 'body', NEW.body, 'category', NEW.category,
    'min_age_months', NEW.min_age_months, 'max_age_months', NEW.max_age_months,
    'author_name', NEW.author_name, 'reviewer_name', NEW.reviewer_name,
    'source_notes', NEW.source_notes, 'source_title', NEW.source_title,
    'source_pages', NEW.source_pages, 'reviewed_at', NEW.reviewed_at,
    'sort_order', NEW.sort_order, 'status', NEW.status
  ));
END;
CREATE TRIGGER feature_content_revision_delete
BEFORE DELETE ON feature_content
BEGIN
  INSERT INTO cms_revisions(entity_type, entity_id, action, snapshot_json)
  VALUES('feature_content', OLD.id, 'deleted', json_object(
    'content_type', OLD.content_type, 'title', OLD.title, 'slug', OLD.slug,
    'summary', OLD.summary, 'body', OLD.body, 'category', OLD.category,
    'min_age_months', OLD.min_age_months, 'max_age_months', OLD.max_age_months,
    'author_name', OLD.author_name, 'reviewer_name', OLD.reviewer_name,
    'source_notes', OLD.source_notes, 'source_title', OLD.source_title,
    'source_pages', OLD.source_pages, 'reviewed_at', OLD.reviewed_at,
    'sort_order', OLD.sort_order, 'status', OLD.status
  ));
END;
