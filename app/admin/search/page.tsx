import { GlobalSearchResults } from "@/components/search/GlobalSearchResults";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/lib/services/search.service";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminSearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const results = q ? await globalSearch(q) : {
    appointments: [],
    doctors: [],
    audit: [],
    notifications: [],
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Global search"
        description="Find appointments, doctors, audit events, and admin notifications in one place."
      />

      <form
        className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        action="/admin/search"
        method="get"
        role="search"
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search patients, doctors, ids…"
          className="shad-input"
          aria-label="Global search query"
        />
        <Button type="submit" className="shad-primary-btn">
          Search
        </Button>
      </form>

      <GlobalSearchResults query={q} results={results} />
    </div>
  );
}
