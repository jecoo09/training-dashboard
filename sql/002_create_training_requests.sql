CREATE TABLE IF NOT EXISTS training_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), submitted_by UUID NOT NULL REFERENCES users(id), submitted_by_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), execution_date DATE NOT NULL, region_label TEXT NOT NULL, region_code TEXT NOT NULL,
  training_title TEXT NOT NULL, program_training TEXT NOT NULL, training_type TEXT NOT NULL CHECK (training_type IN ('Internal', 'Eksternal')),
  training_hours NUMERIC NOT NULL, participant_count INTEGER NOT NULL CHECK (participant_count > 0), total_training_hours NUMERIC NOT NULL,
  trainer_names TEXT NOT NULL, participant_file_id TEXT, participant_file_name TEXT, participant_file_mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES users(id), approved_by_name TEXT, approved_at TIMESTAMPTZ, sheet_row_number INTEGER, sheet_record_no INTEGER
);
CREATE INDEX IF NOT EXISTS training_requests_submitted_by_idx ON training_requests(submitted_by, submitted_at DESC);
CREATE INDEX IF NOT EXISTS training_requests_status_idx ON training_requests(status, submitted_at DESC);
