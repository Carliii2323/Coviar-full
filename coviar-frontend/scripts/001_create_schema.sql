-- Create profiles table for wineries/vineyards
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  -- Administrator data
  admin_first_name TEXT NOT NULL,
  admin_last_name TEXT NOT NULL,
  admin_role TEXT,
  admin_phone TEXT,
  admin_mail TEXT not null,
  -- Winery/vineyard data
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  cuit TEXT,
  bodega_inv TEXT,
  vinedo_inv TEXT,
  provincia TEXT NOT NULL,
  departamento TEXT,
  distrito TEXT,
  actividades JSONB DEFAULT '[]',
  litros_vino_rango TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- Create assessment_responses table
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  indicator_number TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  selected_level INTEGER NOT NULL CHECK (selected_level >= 0 AND selected_level <= 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, chapter_number, indicator_number)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Policies for assessments
CREATE POLICY "assessments_select_own" ON public.assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assessments_insert_own" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assessments_update_own" ON public.assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "assessments_delete_own" ON public.assessments FOR DELETE USING (auth.uid() = user_id);

-- Policies for assessment_responses
CREATE POLICY "responses_select_own" ON public.assessment_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "responses_insert_own" ON public.assessment_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "responses_update_own" ON public.assessment_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "responses_delete_own" ON public.assessment_responses FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    admin_first_name,
    admin_last_name,
    admin_role,
    admin_phone,
    razon_social,
    nombre_fantasia,
    cuit,
    bodega_inv,
    vinedo_inv,
    provincia,
    departamento,
    distrito,
    actividades,
    litros_vino_rango
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'admin_first_name', ''),
    COALESCE(new.raw_user_meta_data->>'admin_last_name', ''),
    COALESCE(new.raw_user_meta_data->>'admin_role', ''),
    COALESCE(new.raw_user_meta_data->>'admin_phone', ''),
    COALESCE(new.raw_user_meta_data->>'razon_social', ''),
    COALESCE(new.raw_user_meta_data->>'nombre_fantasia', ''),
    COALESCE(new.raw_user_meta_data->>'cuit', ''),
    COALESCE(new.raw_user_meta_data->>'bodega_inv', ''),
    COALESCE(new.raw_user_meta_data->>'vinedo_inv', ''),
    COALESCE(new.raw_user_meta_data->>'provincia', ''),
    COALESCE(new.raw_user_meta_data->>'departamento', ''),
    COALESCE(new.raw_user_meta_data->>'distrito', ''),
    COALESCE((new.raw_user_meta_data->>'actividades')::JSONB, '[]'::JSONB),
    COALESCE(new.raw_user_meta_data->>'litros_vino_rango', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
