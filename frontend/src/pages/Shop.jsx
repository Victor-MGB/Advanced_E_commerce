import { useEffect, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import ProductCard from "../components/ProductCard.jsx";
import { EmptyState, Pagination, SectionHeading, Spinner } from "../components/UI.jsx";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [result, setResult] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const keyword = params.get("keyword") || "";
  const category = params.get("category") || "";
  const brand = params.get("brand") || "";
  const sort = params.get("sort") || "popular";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const page = params.get("page") || "1";

  useEffect(() => {
    Promise.all([api.getCategories(), api.getBrands()]).then(([categoryList, brandList]) => {
      setCategories(categoryList);
      setBrands(brandList);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ keyword, category, brand, sort, minPrice, maxPrice, page, limit: 8 })
      .then(setResult)
      .catch(() => setResult({ data: [], total: 0, page: 1, totalPages: 1 }))
      .finally(() => setLoading(false));
  }, [keyword, category, brand, sort, minPrice, maxPrice, page]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const clear = () => setParams(new URLSearchParams());
  const activeFilters = [
    keyword && { key: "keyword", label: `“${keyword}”` },
    category && { key: "category", label: categories.find((item) => item._id === category)?.name || "Category" },
    brand && { key: "brand", label: brands.find((item) => item._id === brand)?.name || "Brand" },
    minPrice && { key: "minPrice", label: `From $${minPrice}` },
    maxPrice && { key: "maxPrice", label: `Up to $${maxPrice}` },
  ].filter(Boolean);

  return (
    <div className="container py-10 sm:py-14">
      <SectionHeading
        eyebrow="The store"
        title={keyword ? `Results for “${keyword}”` : "Shop all products"}
        text="Explore considered essentials across tech, style and home."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button className="btn btn--ghost btn--sm lg:hidden" type="button" onClick={() => setFiltersOpen((open) => !open)}>
          <SlidersHorizontal size={16} /> Filters <ChevronDown size={14} />
        </button>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-full border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-600"
            placeholder="Search products…"
            defaultValue={keyword}
            onKeyDown={(event) => {
              if (event.key === "Enter") update("keyword", event.currentTarget.value.trim());
            }}
          />
        </div>
        <select
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium"
          value={sort}
          onChange={(event) => update("sort", event.target.value)}
          aria-label="Sort products"
        >
          <option value="popular">Most popular</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">{result.total} products</span>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => update(filter.key, "")}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-100"
            >
              {filter.label} <X size={13} />
            </button>
          ))}
          <button type="button" onClick={clear} className="text-xs font-semibold text-slate-500 underline">
            Clear all
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="panel sticky top-24 space-y-7">
            <div>
              <h3 className="text-sm font-bold">Categories</h3>
              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => update("category", "")}
                  className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${!category ? "bg-brand-50 font-bold text-brand-800" : "text-slate-600 hover:text-brand-700"}`}
                >
                  All categories
                </button>
                {categories.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => update("category", item._id)}
                    className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${category === item._id ? "bg-brand-50 font-bold text-brand-800" : "text-slate-600 hover:text-brand-700"}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Brands</h3>
              <div className="mt-3 space-y-1">
                {brands.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => update("brand", brand === item._id ? "" : item._id)}
                    className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${brand === item._id ? "bg-brand-50 font-bold text-brand-800" : "text-slate-600 hover:text-brand-700"}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Price range</h3>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={minPrice}
                  onChange={(event) => update("minPrice", event.target.value)}
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={maxPrice}
                  onChange={(event) => update("maxPrice", event.target.value)}
                />
              </div>
            </div>

            <button type="button" className="btn btn--ghost btn--sm w-full" onClick={clear}>
              Reset filters
            </button>
          </div>
        </aside>

        <div>
          {loading ? (
            <Spinner label="Finding products" />
          ) : result.data.length === 0 ? (
            <EmptyState icon={Search} title="No products found" text="Try a different search or clear your filters." to="/shop" action="Clear filters" />
          ) : (
            <>
              <div className="product-grid">
                {result.data.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    categoryName={categories.find((item) => item._id === product.category)?.name}
                  />
                ))}
              </div>
              <Pagination
                page={Number(page)}
                totalPages={result.totalPages}
                onPage={(next) => update("page", String(next))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
