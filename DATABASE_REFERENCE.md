Table type {
  id uuid [pk]
  type text [not null, unique]
}

Table category {
  id uuid [pk]
  category text [not null]
  type_id uuid [not null, ref: > type.id]
}

Table resources {
  id uuid [pk]
  title text [not null]
  category_id uuid [not null, ref: > category.id]
  url text [not null]
  description text
  favorite boolean
}

Table inspirations {
  id uuid [pk]
  img text
  description text
  category_id uuid [not null, ref: > category.id]
  url text
  favorite boolean
}
<!-- 
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.inspirations
TO authenticated;
 -->

Table tools {
  id uuid [pk]
  title text [not null]
  category_id uuid [not null, ref: > category.id]
  url text [not null]
  favorite boolean
}
<!-- 
GRANT SELECT ON public.tools TO authenticated;
***************
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.tools
TO authenticated;
 -->
<!-- ************* -->
Table posts {
  id uuid [pk]
  title text [not null]
  description text
  status text
  category_id uuid [ref: > category.id]
}

 GRANT SELECT ON public.posts TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.posts
TO authenticated; 

Table ideas {
  id uuid [pk]
  title text [not null]
  description text
  category_id uuid [ref: > category.id]
}


GRANT SELECT ON public.ideas TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.ideas
TO authenticated; 



-- =========================================================================
-- 1. Insert types into the 'type' table
-- =========================================================================

INSERT INTO "type" ("type")
VALUES ('posts'), ('ideas')
ON CONFLICT ("type") DO NOTHING;

-- =========================================================================
-- 2. CREATE TABLE: posts
-- =========================================================================

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "category_id" UUID NOT NULL REFERENCES "public"."category"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

-- Create Policies for authenticated users
CREATE POLICY "Allow authenticated users to read posts"
ON "public"."posts"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert posts"
ON "public"."posts"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update posts"
ON "public"."posts"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete posts"
ON "public"."posts"
FOR DELETE
TO authenticated
USING (true);

-- =========================================================================
-- 3. CREATE TABLE: ideas
-- =========================================================================

CREATE TABLE IF NOT EXISTS "public"."ideas" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category_id" UUID NOT NULL REFERENCES "public"."category"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "public"."ideas" ENABLE ROW LEVEL SECURITY;

-- Create Policies for authenticated users
CREATE POLICY "Allow authenticated users to read ideas"
ON "public"."ideas"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert ideas"
ON "public"."ideas"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ideas"
ON "public"."ideas"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete ideas"
ON "public"."ideas"
FOR DELETE
TO authenticated
USING (true);