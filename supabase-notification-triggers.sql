-- Update the log_issue_activity function to include notification creation
CREATE OR REPLACE FUNCTION log_issue_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (type, title, description, user_id, user_name, issue_id, metadata)
    VALUES (
      'issue_created',
      'New Issue Reported',
      NEW.title,
      NEW.user_id,
      NEW.user_name,
      NEW.id,
      jsonb_build_object('category', NEW.category, 'priority', NEW.priority)
    );

    -- Create notification for issue reporter confirming receipt
    INSERT INTO notifications (user_id, type, title, message, issue_id)
    VALUES (
      NEW.user_id,
      'system',
      'Issue Reported Successfully',
      'Your issue "' || NEW.title || '" has been received and is under review',
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO activities (type, title, description, user_id, user_name, issue_id, metadata)
      VALUES (
        'status_changed',
        'Issue Status Updated',
        NEW.title,
        NEW.user_id,
        NEW.user_name,
        NEW.id,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );

      -- Create notification for issue reporter
      INSERT INTO notifications (user_id, type, title, message, issue_id)
      VALUES (
        NEW.user_id,
        'issue_status',
        'Issue Status Updated',
        'Your issue "' || NEW.title || '" status changed to ' || NEW.status,
        NEW.id
      );
    END IF;

    IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO activities (type, title, description, user_id, user_name, issue_id, metadata)
      VALUES (
        'issue_assigned',
        'Issue Assigned',
        NEW.title,
        NEW.assigned_to,
        'Admin',
        NEW.id,
        jsonb_build_object('assigned_to', NEW.assigned_to)
      );

      -- Create notification for issue reporter about assignment
      INSERT INTO notifications (user_id, type, title, message, issue_id)
      VALUES (
        NEW.user_id,
        'assignment',
        'Issue Assigned',
        'Your issue "' || NEW.title || '" has been assigned to ' || NEW.assigned_to,
        NEW.id
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
