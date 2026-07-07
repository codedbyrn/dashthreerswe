This document defines the global engineering standards for the project. Every new feature, page, or component must follow these rules unless explicitly instructed otherwise.

# Global Development Rules

- Follow the comments inside page.tsx.
- Do not change the existing design system.
- Use Server Components whenever possible.
- Use Client Components only when necessary.
- Separate UI, Business Logic, and Data Layer.
- Create reusable components.
- Use strict TypeScript.
- Use Zod validation.
- Avoid duplicated code.
- Build scalable and maintainable architecture.

## UX

- Skeleton Loading
- Empty State
- Error State
- Success Toast
- Confirmation Dialog before delete
- Disabled buttons while saving
- Responsive Design

## Performance

- Database indexes for searchable/filterable columns.
- Caching for repeated queries.
- Server-side pagination.
- Lazy loading when appropriate.

## Components

Create reusable components whenever possible, including:

- Custom modern Dropdown
- Modal
- Pagination
- Empty State
- Skeleton
- Confirmation Dialog
- Form Inputs
- Buttons
- Tags
- Model Dialog for confirm actions (delete...)
- 404 Page
- 
## Reusable Card Component

Create a reusable `Card` component that can be used across all pages in the system. The component must not be tied to a specific feature (Resources, Ideas, Notes, etc.). Instead, it should render its content dynamically based on the props passed to it.

### Card Layout

#### Header

* Right side: Display a Badge, Tag, or any custom element provided by the parent.
* Left side: Display one or more optional action/status icons (e.g., Favorite, Status, Pin, Visibility).

#### Content

Arrange the following elements vertically:

* Optional horizontal cover image.
* Primary title.
* Link with a link icon.
* Primary description.
* Secondary description limited to a single line with ellipsis (`...`) when overflowing. The truncated text should be clickable to reveal the full content or navigate to the details page.

#### Footer

* Tags section.
* Action buttons:

  * Edit
  * Delete

### Requirements

* Every section and element must be optional and configurable.
* Support passing custom actions and custom content from the parent component.
* Follow the project's design system and spacing.
* Fully responsive.
* Support Skeleton Loading.
* Support Empty State where applicable.
* Prevent unnecessary re-renders.
* Keep the component generic, reusable, scalable, and easy to maintain.
 

## Reusable CRUD Components

### Filter Bar

Create a reusable **Filter Bar** component that can be shared across all CRUD pages.

The component should support displaying only the controls required by each page.

Supported controls include:

* ### Category Filter

The category filter should be reusable and configurable.

Support two display modes:

* **Custom Dropdown** for pages with many categories.
* **Horizontal Filter Buttons (Tabs/Pills)** for pages with a small number of categories.

The parent page should determine which mode to use based on the number of categories and the desired user experience.
Both modes must share the same filtering logic and remain visually consistent with the application's design system.

* Favorite Toggle (display only if the corresponding table contains a `favorite` field).
* Additional filters passed by the parent page.
* Sort options.
* View Switch (Grid/List) when required.

The Filter Bar must be fully reusable, configurable, and consistent with the application's design system.

---

### CRUD Form Modal

Create a reusable modal for **Create** and **Edit** operations.

Requirements:

* Generate the form dynamically based on the database fields of the current table.
* Render the appropriate input component for each database field.
* Exclude system fields such as IDs, timestamps, and computed values unless explicitly required.
* If the table contains a `category_id` relationship, display a Category selector populated from the related categories.
* Allow users to create a new Category directly from the form, automatically linking it to the correct `type_id` associated with the current page.
* Reuse the same modal for both Create and Edit operations.

Standard form actions:

* Cancel
* Save

---

### Infinite Scroll

Create a reusable **Infinite Scroll** component that can be used across all data listing pages.

### Requirements

* Load the initial set of records when the page is first rendered.
* Automatically load the next batch of records when the user scrolls near the bottom of the page.
* Use efficient server-side pagination (cursor-based or offset-based) to fetch data incrementally.
* Display Skeleton Cards while additional data is loading.
* Prevent duplicate requests while a fetch is in progress.
* Stop requesting data when all records have been loaded.
* Handle loading, empty, and error states gracefully.
* Ensure smooth scrolling and optimized performance.
* The component must be reusable, configurable, and independent of any specific data model.
* Any page displaying a collection of cards should use this reusable Infinite Scroll component instead of traditional pagination.
