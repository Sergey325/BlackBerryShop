BEGIN;

-- Seed the canonical catalog colors. Codes are strings intentionally: "06"
-- must retain its leading zero.
INSERT INTO "CatalogColor" ("code", "name", "hex")
VALUES
    ('06',   'Рудий',               '#FF9A44'),
    ('15',   'М''ятний',             '#D7EAE7'),
    ('27',   'Бузковий',             '#C6B1C9'),
    ('31',   'Зефірний',             '#ECCEDC'),
    ('53',   'Темно-сірий',          '#61616D'),
    ('55',   'Білий',               '#F3F2F0'),
    ('62',   'Молочний',            '#E7DFD4'),
    ('98',   'Суха троянда',        '#E7A1CC'),
    ('106',  'Червоний',           '#A4011E'),
    ('107',  'Вишневий',           '#B9083F'),
    ('141',  'Синій',               '#153EAC'),
    ('146',  'Світло-лавандовий', '#D9D0E5'),
    ('149',  'Малиновий',          '#BB2744'),
    ('161',  'Пудровий',           '#FEE7E5'),
    ('166',  'Яскраво-лавандовий', '#9280B4'),
    ('178',  'Півонія',             '#CF6FA6'),
    ('185',  'Рожевий',            '#E4B5CA'),
    ('216',  'Жовтий',              '#F6D34E'),
    ('268',  'Холодний бежевий',    '#B6A8A7'),
    ('287',  'Блакитний',          '#A5D1F1'),
    ('310',  'Шампань',            '#DFC8A6'),
    ('321',  'Шоколадний',         '#6E4832'),
    ('343',  'Сірий',              '#75787D'),
    ('377',  'Яскраво-рожевий',  '#F180A7'),
    ('416',  'Світло-сірий',       '#C4C4CD'),
    ('428',  'Сірий',              '#A3A9B7'),
    ('485',  'Зелений',            '#6A8045'),
    ('493',  'Гіркий шоколадний', '#371A13'),
    ('530',  'Бежевий',            '#A68E82'),
    ('599',  'Слонова кістка',      '#C4BAAC'),
    ('745',  'Молочний',           '#D7D2D1'),
    ('754',  'Бежево-сірий',      '#947E81'),
    ('775',  'Шоколадний',        '#291516'),
    ('776',  'Сіро-блакитний',    '#C2C0D7'),
    ('788',  'Лавандовий',        '#C3B0E2'),
    ('796',  'Рожевий',           '#EBC4DB'),
    ('1060', 'Чорний',            '#291D1B');

-- Abort atomically if a ProductColor code contains a token that is absent
-- from the canonical palette. Both "1060|106" and "1060(106)" are supported.
DO $$
DECLARE
    unknown_codes TEXT;
BEGIN
    SELECT STRING_AGG(codes.code, ', ' ORDER BY codes.code)
    INTO unknown_codes
    FROM (
        SELECT DISTINCT code_match[1] AS code
        FROM "ProductColor" pc
        CROSS JOIN LATERAL regexp_matches(pc."colorCode", '[0-9]+', 'g') AS matches(code_match)
        WHERE pc."colorCode" IS NOT NULL
    ) AS codes
    LEFT JOIN "CatalogColor" cc ON cc."code" = codes.code
    WHERE cc."id" IS NULL;

    IF unknown_codes IS NOT NULL THEN
        RAISE EXCEPTION 'Unknown ProductColor colorCode tokens: %', unknown_codes;
    END IF;
END $$;

-- Backfill coded variants, including two- and three-color combinations.
INSERT INTO "ProductColorFilter" ("productColorId", "catalogColorId")
SELECT DISTINCT
    pc."id",
    cc."id"
FROM "ProductColor" pc
CROSS JOIN LATERAL regexp_matches(pc."colorCode", '[0-9]+', 'g') AS matches(code_match)
JOIN "CatalogColor" cc ON cc."code" = code_match[1]
WHERE pc."colorCode" IS NOT NULL
  AND BTRIM(pc."colorCode") <> ''
ON CONFLICT DO NOTHING;

-- Backfill legacy variants that predate colorCode. Their original display
-- color/name remain untouched on ProductColor.
WITH legacy_mapping("oldHex", "catalogCode") AS (
    VALUES
        ('#EA3637', '106'),
        ('#E1D1B7', '530'),
        ('#F7CCD3', '185'),
        ('#D3B4E0', '27'),
        ('#FCD64D', '216'),
        ('#FFFFFF', '55'),
        ('#000000', '1060')
)
INSERT INTO "ProductColorFilter" ("productColorId", "catalogColorId")
SELECT
    pc."id",
    cc."id"
FROM "ProductColor" pc
JOIN legacy_mapping mapping ON UPPER(pc."color") = mapping."oldHex"
JOIN "CatalogColor" cc ON cc."code" = mapping."catalogCode"
WHERE pc."colorCode" IS NULL
   OR BTRIM(pc."colorCode") = ''
ON CONFLICT DO NOTHING;

-- Refuse a partial migration: every existing variant must be represented by
-- at least one catalog color before the application starts using the relation.
DO $$
DECLARE
    unmapped_variant_ids TEXT;
BEGIN
    SELECT STRING_AGG(pc."id"::TEXT, ', ' ORDER BY pc."id")
    INTO unmapped_variant_ids
    FROM "ProductColor" pc
    WHERE NOT EXISTS (
        SELECT 1
        FROM "ProductColorFilter" pcf
        WHERE pcf."productColorId" = pc."id"
    );

    IF unmapped_variant_ids IS NOT NULL THEN
        RAISE EXCEPTION 'ProductColor rows without catalog colors: %', unmapped_variant_ids;
    END IF;
END $$;

COMMIT;
