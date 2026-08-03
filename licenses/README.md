# License options

Repo này có 2 phần cần license khác nhau:

1. **Mã nguồn** (code Next.js: `app/`, `components/`, `lib/`, `i18n/`, `scripts/`) → chọn 1 trong MIT / Apache-2.0 / GPL-3.0
2. **Nội dung** (bài viết writeups/research, text trên site) → chọn 1 license Creative Commons

## So sánh nhanh

| File | Áp dụng cho | Ý nghĩa | Khuyến nghị |
|---|---|---|---|
| `../LICENSE` (MIT) | Code | Cho dùng lại tự do, kèm credit. Phổ biến nhất trong OSS. | ✅ **Code** |
| `Apache-2.0.txt` | Code | Giống MIT + grant patent rõ ràng, yêu cầu giữ file `NOTICE`. | Chỉ cần nếu bạn quan tâm patent |
| `GPL-3.0.txt` | Code | Copyleft — ai dùng lại phải mở source toàn bộ. | Không hợp portfolio |
| `CC-BY-4.0.txt` | Nội dung | Cho copy, sửa, dùng thương mại — miễn là ghi credit. | Nếu muốn chia sẻ tự do |
| `CC-BY-NC-ND-4.0.txt` | Nội dung | Chỉ được chia sẻ nguyên văn + ghi credit; **cấm sửa đổi** và **cấm dùng thương mại**. | ✅ **Writeups** (bảo vệ nhất) |

## Cách dùng

- **Chọn license cho code:** copy nội dung file đã chọn vào file `LICENSE` ở root repo
  (thay `poqpwppy` bằng tên pháp lý của bạn nếu muốn). GitHub tự nhận diện và
  hiển thị license trên trang repo.
- **Tách code + nội dung (khuyến nghị cho blog):** giữ `LICENSE` = MIT cho code,
  thêm file `LICENSE-CONTENT` (hoặc ghi chú trong `README.md`) với nội dung:

  > The written content in this repository (blog posts, writeups, articles)
  > is licensed under the Creative Commons Attribution-NonCommercial-
  > NoDerivatives 4.0 International License. Code is MIT licensed.
  > See https://creativecommons.org/licenses/by-nc-nd/4.0/

  CC BY-NC-ND là license bảo vệ nhất: người khác được chia sẻ nguyên văn kèm
  credit, nhưng không được sửa đổi hay dùng cho mục đích thương mại.
