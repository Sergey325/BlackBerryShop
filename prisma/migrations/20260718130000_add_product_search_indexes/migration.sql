CREATE INDEX product_name_trgm_idx
    ON "Product" USING gin (name gin_trgm_ops);

CREATE INDEX product_name_fts_idx
    ON "Product"
    USING gin (to_tsvector('simple', name));