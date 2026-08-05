# Google Analytics 4 measurement

WOW Converter sends product analytics only when `VITE_GA_MEASUREMENT_ID` is
defined in a production build. File names, image contents, EXIF data, and other
user-identifying values are never sent.

## Event taxonomy

| Event | Purpose | Main parameters |
| --- | --- | --- |
| `images_added` | Images accepted by the dropzone | `file_count`, `input_formats`, `input_total_kb` |
| `conversion_started` | Conversion intent and chosen settings | `output_format`, `quality_value`, `resize_mode`, `target_width`, `metadata_policy`, `conversion_mode`, `file_count` |
| `conversion_completed` | Successful conversion and efficiency | conversion settings plus `duration_ms`, `output_total_kb`, `saved_kb`, `compression_percent` |
| `conversion_failed` | Conversion reliability | `output_format`, `metadata_policy`, `error_type` |
| `converted_images_downloaded` | Export completion | `download_scope`, `file_count`, `output_format`, `output_total_kb` |
| `image_removed` | File-list cleanup | `conversion_status` |
| `workflow_reset` | A new workflow started | `file_count`, `converted_file_count` |
| `advanced_options_toggled` | Advanced-setting discovery | `state` |

Google enhanced measurement also collects page views, scrolls, outbound clicks,
site search, video engagement, file downloads, and form interactions where they
apply.

## Reuse

- `src/analytics/core.ts` owns GA initialization and the reusable `trackEvent`
  primitive.
- `src/analytics/converterEvents.ts` defines the product event schema and keeps
  UI code free from raw GA calls.

Add new product events to `converterEvents.ts`, keep names in `snake_case`, and
send only aggregate or enumerated values.
