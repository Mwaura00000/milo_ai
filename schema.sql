-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table extending auth.users (assuming Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  academic_level TEXT CHECK (academic_level IN ('university', 'high_school')),
  university TEXT,
  course TEXT,
  year TEXT,
  semester TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects (e.g., "Calculus 101")
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics (e.g., "Derivatives")
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Sessions (Telemetry)
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  interruptions_count INTEGER DEFAULT 0,
  mastery_rating INTEGER CHECK (mastery_rating >= 1 AND mastery_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Materials (Notes / Text)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Chunks for RAG (embeddings)
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- Assuming OpenAI text-embedding-3-small or ada-002
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLR Policies (Row Level Security) - Basic Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy for Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_topic_id ON public.study_sessions(topic_id);
CREATE INDEX idx_document_chunks_embedding ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, academic_level, university, course, year, semester)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'academic_level', 'university'),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE(NEW.raw_user_meta_data->>'course', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', ''),
    COALESCE(NEW.raw_user_meta_data->>'semester', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- New columns for Cognitive Assessment / Learning Profile
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS focus_capacity TEXT CHECK (focus_capacity IN ('Sprinter <25m', 'Deep Worker >60m')),
  ADD COLUMN IF NOT EXISTS energy_rhythm TEXT CHECK (energy_rhythm IN ('Morning Lark', 'Night Owl')),
  ADD COLUMN IF NOT EXISTS processing_style TEXT CHECK (processing_style IN ('Step-by-Step Builder', 'Big Picture Visionary')),
  ADD COLUMN IF NOT EXISTS friction_type TEXT CHECK (friction_type IN ('Easily Distracted', 'Easily Overwhelmed'));

