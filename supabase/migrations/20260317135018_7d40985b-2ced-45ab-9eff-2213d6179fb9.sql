
-- Allow hosts (item creators) to SELECT bookings for their items
-- This is needed for QR code scanning verification
CREATE POLICY "Hosts can view bookings for their items"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  item_id IN (
    SELECT id::uuid FROM public.trips WHERE created_by = auth.uid()
    UNION ALL
    SELECT id::uuid FROM public.hotels WHERE created_by = auth.uid()
    UNION ALL
    SELECT id::uuid FROM public.adventure_places WHERE created_by = auth.uid()
  )
);

-- Allow hosts to update bookings for their items (for check-in)
CREATE POLICY "Hosts can update bookings for their items"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  item_id IN (
    SELECT id::uuid FROM public.trips WHERE created_by = auth.uid()
    UNION ALL
    SELECT id::uuid FROM public.hotels WHERE created_by = auth.uid()
    UNION ALL
    SELECT id::uuid FROM public.adventure_places WHERE created_by = auth.uid()
  )
);
