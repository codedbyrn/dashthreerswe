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

Table tools {
  id uuid [pk]
  title text [not null]
  category_id uuid [not null, ref: > category.id]
  url text [not null]
  favorite boolean
}

Table posts {
  id uuid [pk]
  title text [not null]
  description text
  status text
  category_id uuid [ref: > category.id]
}

Table ideas {
  id uuid [pk]
  title text [not null]
  description text
  category_id uuid [ref: > category.id]
}

Table learning_roadmap {
  id uuid [pk]
  skill text [not null]
  notes text
  priority text
  status text
  source_url text
}
