-- Run this once in the Supabase SQL editor
ALTER TABLE registries ADD COLUMN IF NOT EXISTS std_plan TEXT CHECK (std_plan IN ('essentiel', 'premium'));
