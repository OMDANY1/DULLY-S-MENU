-- DULLY'S MENU — ALTER CALORIES COLUMN TO NUMERIC
-- Reference Timestamp: 20260711193800
--
-- Supports decimal calories (e.g. 2.5 calories for Hot Tea) from the verified static menu data.

ALTER TABLE public.menu_product_variants
ALTER COLUMN calories TYPE NUMERIC(10, 2);
